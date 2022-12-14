using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Signum.Entities.Basics;
using Signum.Entities.Excel;
using Signum.Entities.Reflection;
using Signum.Utilities.Reflection;
using System.Diagnostics;
using System.IO;
using System.Transactions;
using Column = Signum.Entities.DynamicQuery.Column;
using Filter = Signum.Entities.DynamicQuery.Filter;

namespace Signum.Engine.Excel;


public class ImportResult
{
    public int TotalRows; 
    public ImportAction Action;
    public int RowIndex;
    public Lite<Entity>? Entity;
    public string? Error;
}

public enum ImportAction
{
    Inserted,
    Updated,
    NoChanges,
}

internal class TokenGettersAndSetters
{
    public required bool IsId { get; set; }
    public required Func<Entity, ModifiableEntity>? ParentGetter { get; set; }
    public required Action<ModifiableEntity, object?>? Setter { get; set; }
}

public class ImporterFromExcel
{
    public static async IAsyncEnumerable<ImportResult> ImportExcel(QueryRequest request, ImportExcelModel model, OperationSymbol saveOperation)
    {
        var transactionalResults = new List<ImportResult>();

        var file = model.ExcelFile.ToFileContent();

        var (mainType, columns, simpleFilters) = ParseQueryRequest(request);

        var columnGetterSetter = GetColumnGettersAndSetters(columns);
        var filtersGetterSetter = GetColumnGettersAndSetters(simpleFilters.Keys.ToList());

        var qd = QueryLogic.Queries.QueryDescription(request.QueryName);
        var matchBy = model.Mode == ImportExcelMode.InsertOrUpdate || model.Mode == ImportExcelMode.Update ? QueryUtils.Parse(model.MatchByColumn!, qd, 0) : null;
        var matchByIndex = matchBy == null ? (int?)null : columns.IndexOf(Normalize(matchBy, qd, mainType));

        var table = Signum.Engine.Maps.Schema.Current.Table(mainType);

        using (var tr = model.Transactional ? new Transaction() : null)
        using (model.IdentityInsert && model.Transactional ? Administrator.DisableIdentity(table) : null)
        using (var ms = new MemoryStream(file.Bytes))
        using (var document = SpreadsheetDocument.Open(ms, false))
        {
            WorkbookPart workbookPart = document.WorkbookPart!;

            WorksheetPart worksheetPart = document.GetWorksheetPartById("rId1");

            var data = worksheetPart.Worksheet.Descendants<SheetData>().Single();

            var rows = data.Descendants<Row>().Skip(2).ToList();

            bool hasErros = false;

            foreach (var row in rows)
            {
                ImportResult res = new ImportResult
                {
                    RowIndex = (int)row.RowIndex!.Value,
                    TotalRows = rows.Count,
                };

                try
                {
                    var cells = row.Descendants<Cell>().ToDictionary(a => a.GetExcelColumnIndex()!.Value - 1);

                    Entity entity;
                    if (matchBy != null)
                    {
                        var matchCell = cells.TryGetC(matchByIndex!.Value);
                        var strValue = matchCell == null ? null : document.GetCellValue(matchCell);

                        if (strValue.HasText())
                        {
                            var value = ReflectionTools.ChangeType(strValue, matchBy.Type);

                            entity = QueryLogic.Queries.GetEntitiesFull(new QueryEntitiesRequest
                            {
                                QueryName = request.QueryName,
                                Filters = request.Filters.And(new FilterCondition(matchBy, FilterOperation.EqualTo, value)).ToList(),
                                Orders = new List<Order>(),
                            }).SingleOrDefaultEx()!;
                        }
                        else
                        {
                            entity = null!;
                        }

                        if (entity != null)
                        {
                            res.Action = ImportAction.Updated;
                            res.Entity = entity.ToLite();
                        }
                        else
                        {
                            if (model.Mode == ImportExcelMode.InsertOrUpdate)
                            {
                                entity = (Entity)Activator.CreateInstance(mainType)!;
                                res.Action = ImportAction.Inserted;
                            }
                            else
                            {
                                res.Action = ImportAction.Inserted;
                                res.Error = ImportFromExcelMessage.No0FoundInThisQueryWith1EqualsTo2.NiceToString(mainType.NiceName(), matchBy, strValue.DefaultText("null"));
                                continue;
                            }
                        }
                    }
                    else
                    {
                        entity = (Entity)Activator.CreateInstance(mainType)!;
                        res.Action = ImportAction.Inserted;
                    }

                    if (res.Action == ImportAction.Inserted)
                        foreach (var kvp in simpleFilters)
                        {
                            var getSet = filtersGetterSetter.GetOrThrow(kvp.Key);

                            var parent = getSet.ParentGetter != null ? getSet.ParentGetter(entity) : entity;

                            if (!getSet.IsId)
                            {
                                getSet.Setter!(parent, kvp.Value);
                            }
                        }


                    for (int i = 0; i < columns.Count; i++)
                    {
                        var token = columns[i];

                        var getSet = columnGetterSetter.GetOrThrow(token);

                        var cell = cells.TryGetC(i);
                        var strValue = cell == null ? null : document.GetCellValue(cell);

                        var cellReference = ExcelExtensions.GetExcelColumnName((uint)i + 1) + row.RowIndex;

                        if (getSet.IsId)
                        {
                            var id = strValue.HasText() ? PrimaryKey.Parse(strValue, mainType) : (PrimaryKey?)null;

                            if (id != null)
                            {
                                if (entity.IdOrNull == null)
                                {
                                    if (!model.IdentityInsert)
                                        throw new InvalidOperationException($"Unable to set ID because IdentityInsert is not true. Cell Reference = {cellReference}");

                                    entity.SetId(id);
                                }
                                else
                                {
                                    if (!entity.IdOrNull.Equals(id))
                                        throw new InvalidOperationException($"Id does not match. Cell Reference = {cellReference}");
                                }
                            }
                        }
                        else
                        {

                            var ut = token.Type.UnNullify();

                            object? value = !strValue.HasText() ? null :
                                ut switch
                                {
                                    var t when t.IsLite() => Lite.Parse(strValue),
                                    var t when t.IsEntity() => Lite.Parse(strValue).Retrieve(),
                                    var t when ExcelExtensions.IsNumber(t) => Convert.ChangeType(ExcelExtensions.FromExcelNumber(strValue), ut),
                                    var t when ExcelExtensions.IsDate(t) => ReflectionTools.ChangeType(ExcelExtensions.FromExcelDate(strValue), ut),
                                    var t when t == typeof(TimeOnly) => ExcelExtensions.FromExcelTime(strValue),
                                    var t when t == typeof(bool) => strValue == "TRUE" ? true : strValue == "FALSE" ? false : ExcelExtensions.FromExcelNumber(strValue) == 1,
                                    var t => ReflectionTools.TryParse(strValue, token.Type, out value) ? value :
                                       throw new ApplicationException($"Unable to convert '{strValue}' to {token.Type.TypeName()}. Cell Reference = {cellReference}")
                                };
                
                            var parent = getSet.ParentGetter != null ? getSet.ParentGetter(entity) : entity;
                            getSet.Setter!(parent, value);
                        }
                    }

                    var oldTicks = entity.Ticks;

                    if (!model.Transactional && model.IdentityInsert && entity.IsNew)
                    {
                        using (var tr2 = new Transaction())
                        using (Administrator.DisableIdentity(table))
                        {
                            OperationLogic.ServiceExecute(entity, saveOperation);

                            tr2.Commit();
                        }
                    }
                    else
                    {
                        OperationLogic.ServiceExecute(entity, saveOperation);
                    }

                    if (oldTicks == entity.Ticks && res.Action == ImportAction.Updated)
                        res.Action = ImportAction.NoChanges;

                    res.Entity = entity.ToLite();
                }
                catch (Exception e)
                {
                    e.LogException();
                    hasErros = true;
                    res.Error = e.Message;
                }

                if (model.Transactional)
                    transactionalResults.Add(res);
                else
                    yield return res;
            }

            if (tr != null && !hasErros)
                tr.Commit();
        }

        if (!model.Transactional)
        {
            foreach (var res in transactionalResults)
            {
                yield return res;
            }
        }
    }

    private static Dictionary<QueryToken, TokenGettersAndSetters> GetColumnGettersAndSetters(List<QueryToken> columns)
    {
        var columnParentGetter = columns.Select(c =>
        {
            if (c is HasValueToken)
            {
                var pr = c.Parent!.GetPropertyRoute()!;

                if (pr.Parent!.PropertyRouteType != PropertyRouteType.Root)
                    return pr.Parent!.GetLambdaExpression<Entity, ModifiableEntity>(false);

                return null;
            }
            else
            {
                var pr = c.GetPropertyRoute()!;

                if (pr.Parent!.PropertyRouteType != PropertyRouteType.Root)
                    return pr.Parent!.GetLambdaExpression<Entity, ModifiableEntity>(false);

                return null;
            }
        }).ToList();

        var columnSetter = columns.Select(c =>
        {
            if (c is HasValueToken)
            {
                var pr = c.Parent!.GetPropertyRoute()!;
                var pi = pr.PropertyInfo!;

                if (!pi.PropertyType.IsEmbeddedEntity())
                    throw new InvalidOperationException("HasValue only supported for embedded entities");
                
                var p = Expression.Parameter(typeof(ModifiableEntity));
                var obj = Expression.Parameter(typeof(object));

                var prop = Expression.Property(Expression.Convert(p, pi.DeclaringType!), pi);
                
                var value = Expression.Condition(Expression.Convert(obj, typeof(bool)),
                     Expression.Coalesce(prop, Expression.New(pi.PropertyType!)), //Prevent unnecessary new 
                     Expression.Constant(null, pi.PropertyType));


                var lambda = Expression.Lambda<Action<ModifiableEntity, object?>>(Expression.Assign(prop, value), p, obj);

                return lambda;
            }
            else
            {
                var pr = c.GetPropertyRoute()!;
                var prop = pr.PropertyInfo!;

                if (ReflectionTools.PropertyEquals(prop, piId))
                    return null;

                var p = Expression.Parameter(typeof(ModifiableEntity));
                var obj = Expression.Parameter(typeof(object));

                var value = Expression.Convert(obj, prop.PropertyType);

                var body = (Expression)Expression.Assign(Expression.Property(Expression.Convert(p, prop.DeclaringType!), prop), value);

                var lambda = Expression.Lambda<Action<ModifiableEntity, object?>>(body, p, obj);

                return lambda;
            }
        }).ToList();

        var columnGetterSetter = columns.Select((c, i) => KeyValuePair.Create(c, new TokenGettersAndSetters
        {
            IsId = ReflectionTools.PropertyEquals(c.GetPropertyRoute()?.PropertyInfo, piId),
            ParentGetter = columnParentGetter[i]?.Compile(),
            Setter = columnSetter[i]?.Compile(),
        })).ToList();

        return columnGetterSetter.ToDictionaryEx();
    }

    public static (Type mainType, List<QueryToken> columns, Dictionary<QueryToken, object?> simpleFilters) ParseQueryRequest(QueryRequest request)
    {
        var qd = QueryLogic.Queries.QueryDescription(request.QueryName);

        Type entityType = GetEntityType(qd);

        var simpleFilters = GetSimpleFilters(request.Filters, qd, entityType);

        var columns = GetSimpleColumns(request.Columns, qd, entityType);

        var repeatedColumns = columns.Where(token => simpleFilters.ContainsKey(token)).ToList();

        if (repeatedColumns.Any())
            throw new ApplicationException(ImportFromExcelMessage.Columns0AlreadyHaveConstanValuesFromFilters.NiceToString(repeatedColumns.CommaAnd()));

        var authErrors = simpleFilters.Keys.Concat(columns).Distinct().Select(a =>
        {
            var pr = a is HasValueToken ? a.Parent!.GetPropertyRoute() : a.GetPropertyRoute();

            return Signum.Engine.Authorization.PropertyAuthLogic.GetAllowedFor(pr!, Entities.Authorization.PropertyAllowed.Write);
        }).NotNull().ToList();

        if (authErrors.Any())
            throw new ApplicationException(authErrors.ToString("\n"));


        return (entityType, columns, simpleFilters);

    }

    public static Type GetEntityType(QueryDescription qd)
    {
        var implementations = qd.Columns.Single(a => a.IsEntity).Implementations;

        if (implementations == null || implementations.Value.IsByAll || implementations.Value.Types.Only() == null)
            throw new ApplicationException(ImportFromExcelMessage.ThisQueryHasMultipleImplementations0.NiceToString(implementations));

        var mainType = implementations.Value.Types.SingleEx();
        return mainType;
    }

    static List<QueryToken> GetSimpleColumns(List<Column> columns, QueryDescription qd, Type mainType)
    {
        var errors = columns.Select(c => IsSimpleProperty(c.Token, mainType)).NotNull();

        if (errors.Any())
            throw new ApplicationException(ImportFromExcelMessage.SomeColumnsAreIncompatibleForImportingFromExcel.NiceToString() + "\n" +  errors.ToString("\n"));

        var pairs = columns.GroupBy(c => Normalize(c.Token, qd, mainType)).Select(gr => new { gr.Key, Error = gr.Count() == 1 ? null : $"Column '{gr.Key}' is repeated {gr.Count()} times" }).ToList();

        errors = pairs.Select(a => a.Error).NotNull();

        if (errors.Any())
            throw new ApplicationException(errors.ToString("\n"));

        return pairs.Select(a => a.Key).ToList();
    }

    static Dictionary<QueryToken, object?> GetSimpleFilters(List<Filter> filters, QueryDescription qd, Type mainType)
    {
        var errors = filters.Select(f =>
        f is FilterGroup fg ? ImportFromExcelMessage._01IsNotSupported.NiceToString(FilterGroupOperation.And.NiceToString(), FilterGroupOperation.Or.NiceToString()) + fg.ToString() :
        f is FilterCondition fc ? (fc.Operation != FilterOperation.EqualTo ? $"Operation {fc.Operation.NiceToString()} is not supported: " + fc.Token.NiceName() : IsSimpleProperty(fc.Token, mainType)) :
        throw new UnexpectedValueException(f))
        .NotNull().ToList();

        if (errors.Any())
            throw new ApplicationException(
                ImportFromExcelMessage.SomeFiltersAreIncompatibleForImportingFromExcel.NiceToString() + "\n" +
                ImportFromExcelMessage.SimplePropertyEqualsValueFiltersCanBeUsedToAssignConstantValuesAnythingElseIsNoAllowed.NiceToString() + "\n" +
                errors.ToString("\n"));

        return filters.Cast<FilterCondition>().AgGroupToDictionary(a => Normalize(a.Token, qd, mainType), gr =>
        {
            var values = gr.Select(a => a.Value).Distinct();
            if (values.Count() > 1)
                throw new ApplicationException(ImportFromExcelMessage.ManyFiltersTryToAssignTheSameProperty0WithDifferentValues1.NiceToString(gr.Key, values.ToString(", ")));

            return values.Only();
        });
    }

    static QueryToken Normalize(QueryToken token, QueryDescription qd, Type mainType)
    {
        if (token is ColumnToken ct)
        {
            var pr = ct.GetPropertyRoute()!;

            if (pr.RootType == mainType)
                return QueryUtils.Parse("Entity." + ct.GetPropertyRoute()!.PropertyInfo!.Name, qd, 0);
        }

        return token;
    }

    static readonly PropertyInfo piId = ReflectionTools.GetPropertyInfo((Entity e) => e.Id);


    static string? IsSimpleProperty(QueryToken token, Type mainType)
    {
        var filterType = QueryUtils.TryGetFilterType(token.Type);
        if (filterType == null)
            return ImportFromExcelMessage._0IsNotSupported.NiceToString(token.NiceTypeName);

        if (filterType == FilterType.Embedded)
            return " ".Combine(
                ImportFromExcelMessage._01CanNotBeAssignedDirectylEachNestedFieldShouldBeAssignedIndependently.NiceToString(token.Type.TypeName(), token.NiceTypeName),
                token.GetPropertyRoute()?.PropertyInfo?.IsNullable() == true ? ImportFromExcelMessage._01CanAlsoBeUsed.NiceToString(token, QueryTokenMessage.HasValue.NiceToString()) : null);

        var incompatible = token.Follow(t => t.Parent).Reverse()
        .Select(t =>
            t is ColumnToken c && c.GetPropertyRoute() is { } pr && pr.RootType == mainType ? null :
            t is EntityPropertyToken ep ? null :
            t is CollectionElementToken ce ? null :
            t is HasValueToken hv && hv.Parent!.Type.IsEmbeddedEntity() ? null :
            ImportFromExcelMessage._01IsIncompatible.NiceToString(t, t.GetType().Name)
        ).NotNull().FirstOrDefault();

        if (incompatible != null)
            return incompatible;

        var pi =
            token is ColumnToken c ? c.GetPropertyRoute()?.PropertyInfo :
            token is EntityPropertyToken ept ? ept.PropertyInfo :
            null;

        if (pi == null)
            return null;

        if (ReflectionTools.PropertyEquals(pi, piId))
            return null;

        if (pi.IsReadOnly())
            return ImportFromExcelMessage._0IsReadOnly.NiceToString(pi.NiceName());

        return null;
    }

}
