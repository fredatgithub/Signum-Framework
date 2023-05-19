import * as React from 'react'
import { DateTime } from 'luxon'
import { Dic, areEqual, classes, KeyGenerator } from '../Globals'
import {
  FilterOptionParsed, QueryDescription, QueryToken, SubTokensOptions, getFilterOperations, isList, FilterOperation, FilterConditionOptionParsed, FilterGroupOptionParsed,
  isFilterGroupOptionParsed, hasAnyOrAll, getTokenParents, isPrefix, FilterConditionOption, PinnedFilter, PinnedFilterParsed, isCheckBox, canSplitValue, getFilterGroupUnifiedFilterType
} from '../FindOptions'
import { SearchMessage, Lite, EntityControlMessage, Entity, toMList, MList, newMListElement } from '../Signum.Entities'
import { isNumber, trimDateToFormat, ValueLineController } from '../Lines/ValueLine'
import { ValueLine, EntityLine, EntityCombo, StyleContext, FormControlReadonly, EntityStrip } from '../Lines'
import { Binding, IsByAll, tryGetTypeInfos, toLuxonFormat, getTypeInfos, toNumberFormat, PropertyRoute } from '../Reflection'
import { TypeContext } from '../TypeContext'
import QueryTokenBuilder from './QueryTokenBuilder'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DashboardBehaviour, FilterGroupOperation, PinnedFilterActive } from '../Signum.DynamicQuery';
import "./FilterBuilder.css"
import { NumericTextBox } from '../Lines/ValueLine';
import { useStateWithPromise, useForceUpdate, useForceUpdatePromise } from '../Hooks'
import { Button, Dropdown, OverlayTrigger, Popover } from 'react-bootstrap'
import { TypeEntity } from '../Signum.Basics'
import PinnedFilterBuilder from './PinnedFilterBuilder'

interface FilterBuilderProps {
  filterOptions: FilterOptionParsed[];
  subTokensOptions: SubTokensOptions;
  queryDescription: QueryDescription;
  onTokenChanged?: (token: QueryToken | undefined) => void;
  lastToken?: QueryToken;
  onFiltersChanged?: (filters: FilterOptionParsed[]) => void;
  onHeightChanged?: () => void;
  readOnly?: boolean;
  title?: React.ReactNode;
  renderValue?: (rvc: RenderValueContext) => React.ReactElement<any> | undefined;
  showPinnedFiltersOptions?: boolean;
  showPinnedFiltersOptionsButton?: boolean;
  showDashboardBehaviour?: boolean;
  avoidPreview?: boolean;
}

export default function FilterBuilder(p: FilterBuilderProps) {

  const [showPinnedFiltersOptions, setShowPinnedFiltersOptions] = React.useState<boolean>(p.showPinnedFiltersOptions ?? false)

  const forceUpdate = useForceUpdatePromise();

  function handlerNewFilter(e: React.MouseEvent<any>, isGroup: boolean) {
    e.preventDefault();
    var lastToken = p.lastToken;

    p.filterOptions.push(isGroup ?
      {
        groupOperation: "Or",
        token: lastToken && hasAnyOrAll(lastToken) ? getTokenParents(lastToken).filter(a => a.queryTokenType == "AnyOrAll").lastOrNull() : undefined,
        filters: [],
        frozen: false,
        expanded: true,
      } as FilterGroupOptionParsed :
      {
        token: p.lastToken,
        operation: (lastToken && (getFilterOperations(lastToken) ?? []).firstOrNull()) ?? undefined,
        value: undefined,
        frozen: false
      } as FilterConditionOptionParsed);

    if (p.onFiltersChanged)
      p.onFiltersChanged(p.filterOptions);

    forceUpdate().then(handleHeightChanged);
  };

  function handlerDeleteFilter(filter: FilterOptionParsed) {
    p.filterOptions.remove(filter);
    if (p.onFiltersChanged)
      p.onFiltersChanged(p.filterOptions);
    forceUpdate().then(handleHeightChanged);
  };

  function handleDeleteAllFilters(e: React.MouseEvent) {
    e.preventDefault();

    var filtersCount = p.filterOptions.length;
    p.filterOptions.filter(fo => !fo.frozen).forEach(fo => p.filterOptions.remove(fo));
    if (p.filterOptions.length == filtersCount)
      return;

    if (p.onFiltersChanged)
      p.onFiltersChanged(p.filterOptions);
    forceUpdate().then(handleHeightChanged);
  };

  function handleFilterChanged() {
    if (p.onFiltersChanged)
      p.onFiltersChanged(p.filterOptions);

    if (showPinnedFiltersOptions)
      forceUpdate();
  };

  function handleHeightChanged() {
    if (p.onHeightChanged)
      p.onHeightChanged();
  }


  var keyGenerator = React.useMemo(() => new KeyGenerator(), []);
  var showDashboardBehaviour = showPinnedFiltersOptions && (p.showDashboardBehaviour ?? true);
  return (
    <fieldset className="form-xs">
      {showPinnedFiltersOptions && !p.avoidPreview && <div className="mb-3 border-bottom">
        <h4 className="lead">Preview</h4>
        <PinnedFilterBuilder filterOptions={p.filterOptions} onFiltersChanged={handleFilterChanged} />
      </div>
      }
      {p.title && <legend>{p.title}</legend>}
      <div className="sf-filters-list table-responsive" style={{ overflowX: "visible" }}>
        <table className="table-sm">
          <thead>
            <tr>
              <th className="ps-0">
                <div className="d-flex">
                  {!p.readOnly && p.filterOptions.length > 0 &&
                    <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.DeleteAllFilter.niceToString() : undefined}
                      className="sf-line-button sf-remove sf-remove-filter-icon"
                      onClick={handleDeleteAllFilters}>
                      <FontAwesomeIcon icon="xmark" />
                    </a>}
                  {SearchMessage.Field.niceToString()}
                </div>
              </th>
              <th>{SearchMessage.Operation.niceToString()}</th>
              <th style={{ paddingRight: "20px" }}>{SearchMessage.Value.niceToString()}</th>
              {showPinnedFiltersOptions && <th></th>}
              {showDashboardBehaviour && <th></th>}
              {showPinnedFiltersOptions && <th>{SearchMessage.Label.niceToString()}</th>}
              {showPinnedFiltersOptions && <th>{SearchMessage.Column.niceToString()}</th>}
              {showPinnedFiltersOptions && <th>{SearchMessage.Row.niceToString()}</th>}
              {showPinnedFiltersOptions && <th>{SearchMessage.IsActive.niceToString()}</th>}
              {showPinnedFiltersOptions && <th>{SearchMessage.Split.niceToString()}</th>}
            </tr>
          </thead>
          <tbody>
            {p.filterOptions.map((f) => isFilterGroupOptionParsed(f) ?
              <FilterGroupComponent key={keyGenerator.getKey(f)} filterGroup={f} readOnly={Boolean(p.readOnly)} onDeleteFilter={handlerDeleteFilter}
                prefixToken={undefined}
                subTokensOptions={p.subTokensOptions} queryDescription={p.queryDescription}
                onTokenChanged={p.onTokenChanged} onFilterChanged={handleFilterChanged}
                lastToken={p.lastToken} onHeightChanged={handleHeightChanged} renderValue={p.renderValue}
                showPinnedFiltersOptions={showPinnedFiltersOptions}
                showDashboardBehaviour={showDashboardBehaviour}
                disableValue={false}
                level={0}
              /> :
              <FilterConditionComponent key={keyGenerator.getKey(f)} filter={f} readOnly={Boolean(p.readOnly)} onDeleteFilter={handlerDeleteFilter}
                prefixToken={undefined}
                subTokensOptions={p.subTokensOptions} queryDescription={p.queryDescription}
                onTokenChanged={p.onTokenChanged} onFilterChanged={handleFilterChanged} renderValue={p.renderValue}
                showPinnedFiltersOptions={showPinnedFiltersOptions}
                showDashboardBehaviour={showDashboardBehaviour}
                disableValue={false}
                level={0} />
            )}
            {!p.readOnly &&
              <tr className="sf-filter-create">
                <td colSpan={4}>
                  <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.AddFilter.niceToString() : undefined}
                    className="sf-line-button sf-create sf-create-condition"
                    onClick={e => handlerNewFilter(e, false)}>
                    <FontAwesomeIcon icon="plus" className="sf-create me-1" />{SearchMessage.AddFilter.niceToString()}
                  </a>
                  <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.AddGroup.niceToString() : undefined}
                    className="sf-line-button sf-create sf-create-group ms-3"
                    onClick={e => handlerNewFilter(e, true)}>
                    <FontAwesomeIcon icon="plus" className="sf-create me-1" />{SearchMessage.AddGroup.niceToString()}
                  </a>

                  {p.showPinnedFiltersOptionsButton && <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.EditPinnedFilters.niceToString() : undefined}
                    className="sf-line-button ms-3"
                    onClick={e => { e.preventDefault(); setShowPinnedFiltersOptions(!showPinnedFiltersOptions); }}>
                    <FontAwesomeIcon color="orange" icon={[showPinnedFiltersOptions ? "fas" : "far", "pen-to-square"]} className="me-1" />{SearchMessage.EditPinnedFilters.niceToString()}
                  </a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </fieldset>
  );
}


export interface RenderValueContext {
  filter: FilterConditionOptionParsed | FilterGroupOptionParsed;
  readonly: boolean;
  handleValueChange: () => void;
}

export interface FilterGroupComponentsProps {
  prefixToken: QueryToken | undefined;
  filterGroup: FilterGroupOptionParsed;
  readOnly: boolean;
  onDeleteFilter: (fo: FilterGroupOptionParsed) => void;
  queryDescription: QueryDescription;
  subTokensOptions: SubTokensOptions;
  onTokenChanged?: (token: QueryToken | undefined) => void;
  onFilterChanged: () => void;
  onHeightChanged: () => void;
  lastToken: QueryToken | undefined;
  renderValue?: (rvc: RenderValueContext) => React.ReactElement<any> | undefined;
  showPinnedFiltersOptions: boolean;
  showDashboardBehaviour: boolean;
  disableValue: boolean;
  level: number;
}

export function FilterGroupComponent(p: FilterGroupComponentsProps) {

  const forceUpdate = useForceUpdate();
  const forceUpdatePromise = useForceUpdatePromise();

  function handleDeleteFilter(e: React.MouseEvent<any>) {
    e.preventDefault();
    p.onDeleteFilter(p.filterGroup);
  }

  function handleTokenChanged(newToken: QueryToken | null | undefined) {

    const f = p.filterGroup;
    f.token = newToken ?? undefined;
    if (p.onTokenChanged)
      p.onTokenChanged(newToken ?? undefined);
    p.onFilterChanged();
    forceUpdate();
  }

  function handleChangeOperation(e: React.FormEvent<HTMLSelectElement>) {
    const operation = (e.currentTarget as HTMLSelectElement).value as FilterGroupOperation;

    p.filterGroup.groupOperation = operation;

    p.onFilterChanged();

    forceUpdate();
  }

  function handlerDeleteFilter(filter: FilterOptionParsed) {
    p.filterGroup.filters.remove(filter);
    if (p.onFilterChanged)
      p.onFilterChanged();
    forceUpdatePromise().then(() => p.onHeightChanged());
  };



  function handlerNewFilter(e: React.MouseEvent<any>, isGroup: boolean) {

    e.preventDefault();

    let lastToken = p.lastToken;
    if (!lastToken || p.filterGroup.token && !isPrefix(p.filterGroup.token, lastToken))
      lastToken = p.filterGroup.token;

    p.filterGroup.filters.push(isGroup ?
      {
        groupOperation: p.filterGroup.groupOperation == "And" ? "Or" : "And",
        token: lastToken && hasAnyOrAll(lastToken) ? getTokenParents(lastToken).filter(a => a.queryTokenType == "AnyOrAll").lastOrNull() : p.prefixToken,
        filters: [],
        frozen: false,
        expanded: true,
      } as FilterGroupOptionParsed :
      {
        token: lastToken,
        operation: lastToken && getFilterOperations(lastToken).firstOrNull() || undefined,
        value: undefined,
        frozen: false
      } as FilterConditionOptionParsed);


    p.onFilterChanged();

    forceUpdatePromise().then(() => p.onHeightChanged());
  };

  function handleExpandCollapse(e: React.MouseEvent<any>) {
    e.preventDefault();
    const fg = p.filterGroup;
    fg.expanded = !fg.expanded;

    forceUpdatePromise().then(() => p.onHeightChanged());
  }

  const fg = p.filterGroup;

  var keyGenerator = React.useMemo(() => new KeyGenerator(), []);

  if (!p.showPinnedFiltersOptions && !isFilterActive(fg))
    return null;

  const readOnly = fg.frozen || p.readOnly;

  var paddingLeft = (25 * p.level);
  var paddingLeftNext = (25 * (p.level + 1)) + 5;
  return (
    <>
      <tr className="sf-filter-group" style={{ backgroundColor: "#eee" }}>
        <td style={{ paddingLeft: paddingLeft }}>
          <div className="d-flex">
            {!readOnly &&
              <a href="#"
                className="sf-line-button sf-remove sf-remove-filter-icon"
                onClick={handleDeleteFilter}>
                <FontAwesomeIcon icon="xmark" title={StyleContext.default.titleLabels ? SearchMessage.DeleteFilter.niceToString() : undefined} />
              </a>}


            <div className="align-items-center d-flex">
              <a href="#"
                onClick={handleExpandCollapse}
                className={classes(fg.expanded ? "sf-hide-group-button" : "sf-show-group-button", "ms-2")} >
                <FontAwesomeIcon icon={fg.expanded ? ["far", "square-minus"] : ["far", "square-plus"]} className="me-2"
                  title={(fg.expanded ? EntityControlMessage.Collapse : EntityControlMessage.Expand).niceToString()} />
              </a>
              <small style={{ whiteSpace: "nowrap" }}>
              Group Prefix:
              </small>
              <div className={classes("rw-widget-xs mx-2", fg.token == null ? "hidden" : undefined)}>
                <QueryTokenBuilder
                  prefixQueryToken={p.prefixToken}
                  queryToken={fg.token}
                  onTokenChange={handleTokenChanged}
                  queryKey={p.queryDescription.queryKey}
                  subTokenOptions={p.subTokensOptions}
                  readOnly={readOnly} />
              </div>
            </div>
          </div>
             
        </td>
        <td>
          <select className="form-select form-select-xs sf-group-selector fw-bold" value={fg.groupOperation as any} disabled={readOnly} onChange={handleChangeOperation}>
            {FilterGroupOperation.values().map((ft, i) => <option key={i} value={ft as any}>{FilterGroupOperation.niceToString(ft)}</option>)}
          </select>
        </td>
        <td>
          {fg.pinned &&
            <div>
              {renderValue()}
            </div>
          }
        </td>
        <td>
          {p.showPinnedFiltersOptions &&
            <button className={classes("btn", "btn-link", "btn-sm", "sf-user-filter", fg.pinned && "active")}
              title={fg.pinned ? SearchMessage.UnpinFilter.niceToString() : SearchMessage.PinFilter.niceToString()}
              onClick={e => {
                fg.pinned = fg.pinned ? undefined : {};
                fixDashboardBehaviour(fg);
                changeFilter();
              }} disabled={p.readOnly}>
              <FontAwesomeIcon color="orange" icon={"thumbtack"} rotation={fg.pinned ? undefined : 90} style={{ minWidth: 15 }} />
            </button>
          }
        </td>

        {p.showPinnedFiltersOptions && p.showDashboardBehaviour && <td>
          <DashboardBehaviourComponent filter={fg} readonly={readOnly} onChange={() => changeFilter()} />
        </td>}
        {p.showPinnedFiltersOptions && fg.pinned && <PinnedFilterEditor fo={fg} onChange={() => changeFilter()} readonly={readOnly}  />}
      </tr >

      {
        fg.expanded ?
          <>
            {fg.filters.map((f) => isFilterGroupOptionParsed(f) ?

              <FilterGroupComponent key={keyGenerator.getKey(f)} filterGroup={f} readOnly={Boolean(p.readOnly)} onDeleteFilter={handlerDeleteFilter}
                prefixToken={fg.token}
                subTokensOptions={p.subTokensOptions} queryDescription={p.queryDescription}
                onTokenChanged={p.onTokenChanged} onFilterChanged={p.onFilterChanged}
                lastToken={p.lastToken} onHeightChanged={p.onHeightChanged} renderValue={p.renderValue}
                showPinnedFiltersOptions={p.showPinnedFiltersOptions}
                showDashboardBehaviour={p.showDashboardBehaviour}
                disableValue={p.disableValue || fg.pinned != null && !isCheckBox(fg.pinned.active)}
                level={p.level + 1}
              /> :

              <FilterConditionComponent key={keyGenerator.getKey(f)} filter={f} readOnly={Boolean(p.readOnly)} onDeleteFilter={handlerDeleteFilter}
                prefixToken={fg.token}
                subTokensOptions={p.subTokensOptions} queryDescription={p.queryDescription}
                onTokenChanged={p.onTokenChanged} onFilterChanged={p.onFilterChanged} renderValue={p.renderValue}
                showPinnedFiltersOptions={p.showPinnedFiltersOptions}
                showDashboardBehaviour={p.showDashboardBehaviour}
                disableValue={p.disableValue || fg.pinned != null && !isCheckBox(fg.pinned.active)}
                level={p.level + 1}
              />
            )}
            {!p.readOnly &&
              <tr className="sf-filter-create">
                <td colSpan={4} style={{ paddingLeft: paddingLeftNext }}>
                  <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.AddFilter.niceToString() : undefined}
                    className="sf-line-button sf-create"
                    onClick={e => handlerNewFilter(e, false)}>
                    <FontAwesomeIcon icon="plus" className="sf-create" />&nbsp;{SearchMessage.AddFilter.niceToString()}
                  </a>

                  <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.AddGroup.niceToString() : undefined}
                    className="sf-line-button sf-create ms-3"
                    onClick={e => handlerNewFilter(e, true)}>
                    <FontAwesomeIcon icon="plus" className="sf-create" />&nbsp;{SearchMessage.AddGroup.niceToString()}
                  </a>
                </td>
              </tr>
            }
          </> :
          <>
            <tr>
              <td colSpan={4} style={{ color: "#aaa", textAlign: "center", fontSize: "smaller", paddingLeft: paddingLeftNext }}>
                {SearchMessage._0FiltersCollapsed.niceToString(fg.filters.length)}
              </td>
            </tr>
          </>
      }
    </>
  );

  function renderValue() {

    if (p.renderValue)
      return p.renderValue({ filter: p.filterGroup, handleValueChange, readonly: p.readOnly });

    const f = p.filterGroup;

    if (f.filters.map(a => getFilterGroupUnifiedFilterType(a.token!.type) ?? "").distinctBy().onlyOrNull() == null && f.value)
      f.value = undefined;

    const readOnly = p.readOnly || f.frozen;

    const ctx = new TypeContext<any>(undefined, { formGroupStyle: "None", readOnly: readOnly, formSize: "xs" }, undefined, Binding.create(f, a => a.value));

    var isComplex = f.filters.some(sf => !isFilterGroupOptionParsed(sf) && sf.operation == "ComplexCondition");
    var textArea = f.filters.some(sf => !isFilterGroupOptionParsed(sf) && (sf.operation == "ComplexCondition" || sf.operation == "FreeText"));

    if (textArea)
      return <FilterTextArea ctx={ctx} isComplex={isComplex} onChange={() => handleValueChange()} />;
    else {
      var tr = f.filters.map(a => a.token!.type).distinctBy(a => a.name).onlyOrNull();
      var format = (tr && f.filters.map((a, i) => a.token!.format ?? `${i}`).distinctBy().onlyOrNull()) ?? undefined;
      var unit = (tr && f.filters.map((a, i) => a.token!.unit ?? `${i}`).distinctBy().onlyOrNull()) ?? undefined;
      const vlt = tr && ValueLineController.getValueLineType(tr);

      return <ValueLine ctx={ctx} type={vlt != null ? tr! : { name: "string" }} format={format} unit={unit} onChange={() => handleValueChange()} />
   }
}
  }

  function handleValueChange() {
    forceUpdate();
    p.onFilterChanged();
  }

  function changeFilter() {
    forceUpdate();
    p.onFilterChanged();
  }
}

function isFilterActive(fo: FilterOptionParsed) {
  if (fo.pinned == null)
    return true;

  if (fo.pinned.splitValue && (fo.value == null || fo.value == ""))
    return false;

  return fo.pinned.active == null /*Always*/ ||
    fo.pinned.active == "Always" ||
    fo.pinned.active == "Checkbox_Checked" ||
    fo.pinned.active == "NotCheckbox_Unchecked" ||
    fo.pinned.active == "WhenHasValue" && !(fo.value == null || fo.value == "");
}

export interface FilterConditionComponentProps {
  filter: FilterConditionOptionParsed;
  prefixToken: QueryToken | undefined;
  readOnly: boolean;
  onDeleteFilter: (fo: FilterConditionOptionParsed) => void;
  queryDescription: QueryDescription;
  subTokensOptions: SubTokensOptions;
  onTokenChanged?: (token: QueryToken | undefined) => void;
  onFilterChanged: () => void;
  renderValue?: (rvc: RenderValueContext) => React.ReactElement<any> | undefined;
  showPinnedFiltersOptions: boolean;
  showDashboardBehaviour: boolean;
  disableValue: boolean;
  level: number;
}

export function FilterConditionComponent(p: FilterConditionComponentProps) {

  const forceUpdate = useForceUpdate();

  function handleDeleteFilter(e: React.MouseEvent<any>) {
    e.preventDefault();
    p.onDeleteFilter(p.filter);
  }

  function handleTokenChanged(newToken: QueryToken | null | undefined) {

    const f = p.filter;

    if (newToken == undefined) {
      f.operation = undefined;
      f.value = undefined;
    }
    else {

      if (!areEqual(f.token, newToken, a => a.filterType) ||
        !areEqual(f.token, newToken, a => a.preferEquals) ||
        newToken.filterType == "Lite" && f.value != null && newToken.type.name != IsByAll && !getTypeInfos(newToken.type.name).some(t => t.name == (f.value as Lite<any>).EntityType)) {
        f.operation = newToken.preferEquals ? "EqualTo" : newToken.filterType && getFilterOperations(newToken).first();
        f.value = f.operation && isList(f.operation) ? [undefined] : undefined;
      }
      else if (f.token && f.token.filterType == "DateTime" && newToken.filterType == "DateTime") {
        if (f.value) {
          const type = newToken.type.name as "DateOnly" | "DateTime";

          function convertDateToNewFormat(val: string) {
            var date = DateTime.fromISO(val);
            if (!date.isValid)
              return val;

            const trimmed = trimDateToFormat(date, type, newToken!.format);
            return type == "DateOnly" ? trimmed.toISODate() : trimmed.toISO();
          }

          if (f.operation && isList(f.operation)) {
            f.value = (f.value as string[]).map(v => convertDateToNewFormat(v));
          } else {
            f.value = convertDateToNewFormat(f.value);
          }
        }
      }
    }

    f.token = newToken ?? undefined;

    if (p.filter.pinned?.splitValue && !canSplitValue(p.filter))
      p.filter.pinned.splitValue = undefined;

    if (p.onTokenChanged)
      p.onTokenChanged(newToken ?? undefined);

    p.onFilterChanged();

    forceUpdate();
  }

  function handleChangeOperation(event: React.FormEvent<HTMLSelectElement>) {
    const operation = (event.currentTarget as HTMLSelectElement).value as FilterOperation;
    if (isList(operation) != isList(p.filter.operation!))
      p.filter.value = isList(operation) && p.filter.token?.filterType == "Lite" ? [p.filter.value].notNull() :
        isList(operation) ? [p.filter.value] :
        p.filter.value[0];

    p.filter.operation = operation;
    if (p.filter.pinned?.splitValue && !canSplitValue(p.filter))
      p.filter.pinned.splitValue = undefined;

    p.onFilterChanged();

    forceUpdate();
  }

  const f = p.filter;

  const readOnly = f.frozen || p.readOnly;

  if (!p.showPinnedFiltersOptions && !isFilterActive(f))
    return null;

  return (
    <>
      <tr className="sf-filter-condition">
        <td style={{ paddingLeft: (25 * p.level) }}>
          <div className="d-flex">
            {!readOnly &&
              <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.DeleteFilter.niceToString() : undefined}
                className="sf-line-button sf-remove sf-remove-filter-icon"
                onClick={handleDeleteFilter}>
                <FontAwesomeIcon icon="xmark" />
              </a>}
            <div className="rw-widget-xs">
              <QueryTokenBuilder
                prefixQueryToken={p.prefixToken}
                queryToken={f.token}
                onTokenChange={handleTokenChanged}
                queryKey={p.queryDescription.queryKey}
                subTokenOptions={p.subTokensOptions}
                readOnly={readOnly} />
            </div>
          </div>
        </td>
        <td className="sf-filter-operation">
          {f.token && f.token.filterType && f.operation &&
            <select className="form-select form-select-xs" value={f.operation} disabled={readOnly} onChange={handleChangeOperation}>
              {f.token.filterType && getFilterOperations(f.token)
                .map((ft, i) => <option key={i} value={ft as any} title={FilterOperation.niceToString(ft)}>{niceNameOrSymbol(ft)}</option>)}
            </select>}
        </td>

        <td className="sf-filter-value">
          {p.disableValue ? <small className="text-muted">{SearchMessage.ParentValue.niceToString()}</small> :
            f.token && f.token.filterType && f.operation && renderValue()}
        </td>
        {p.showPinnedFiltersOptions &&
          <td>
            {f.token && f.token.filterType && f.operation && !p.disableValue && < button className={classes("btn", "btn-link", "btn-sm", "sf-user-filter", f.pinned && "active")} onClick={e => {
              f.pinned = f.pinned ? undefined : {};
              fixDashboardBehaviour(f);
              changeFilter();
            }}
              disabled={p.readOnly}>
              <FontAwesomeIcon color="orange" icon={"thumbtack"} rotation={f.pinned ? undefined : 90} title={(f.pinned ? SearchMessage.PinFilter : SearchMessage.UnpinFilter).niceToString()} style={{ minWidth: 15 }} />
            </button>
            }
          </td>
        }
        {p.showDashboardBehaviour && <td>
          <DashboardBehaviourComponent filter={f} readonly={readOnly} onChange={() => changeFilter()} />
        </td>}

        {p.showPinnedFiltersOptions && f.pinned && <PinnedFilterEditor fo={f} onChange={() => changeFilter()} readonly={readOnly} />}

      </tr>
    </>
  );

  function changeFilter() {
    forceUpdate();
    p.onFilterChanged();
  }

  function renderValue() {

    if (p.renderValue)
      return p.renderValue({ filter: p.filter, handleValueChange, readonly: p.readOnly });

    const f = p.filter;

    const readOnly = p.readOnly || f.frozen;

    if (isList(f.operation!)) {
      if (f.token?.filterType == "Lite" && !p.renderValue)
        return <MultiEntity values={f.value} readOnly={readOnly} type={f.token.type.name} onChange={handleValueChange} />;

      return <MultiValue values={f.value} onRenderItem={ctx => createFilterValueControl(ctx, f.token!, handleValueChange, { mandatory: true })} readOnly={readOnly} onChange={handleValueChange} />;
    }

    const ctx = new TypeContext<any>(undefined, { formGroupStyle: "None", readOnly: readOnly, formSize: "xs" }, undefined, Binding.create(f, a => a.value));

    if (f.operation == "ComplexCondition" || f.operation == "FreeText") {
      const isComplex = f.operation == "ComplexCondition";
      return <FilterTextArea ctx={ctx} isComplex={isComplex} onChange={handleValueChange} />;
    }

    return createFilterValueControl(ctx, f.token!, handleValueChange, { });
  }

  function handleValueChange() {
    forceUpdate();
    p.onFilterChanged();
  }
}


interface PinnedFilterEditorProps {
  fo: FilterOptionParsed;
  readonly: boolean;
  onChange: () => void;
}


export function PinnedFilterEditor(p: PinnedFilterEditorProps) {

  var pinned = p.fo.pinned!;

  return (
    <>
      <td className="sf-pinned-filter-cell">
        <div>
          <input type="text" className="form-control form-control-xs" placeholder={SearchMessage.Label.niceToString()} readOnly={p.readonly}
            value={pinned.label ?? ""}
            onChange={e => { pinned.label = e.currentTarget.value; p.onChange(); }} />
        </div>
      </td>

      <td className="sf-pinned-filter-cell">
        {numericTextBox(Binding.create(pinned, _ => _.column), SearchMessage.Column.niceToString())}
      </td>

      <td className="sf-pinned-filter-cell">
        {numericTextBox(Binding.create(pinned, _ => _.row), SearchMessage.Row.niceToString())}
      </td>

      <td className="sf-pinned-filter-cell">
        {renderActiveDropdown(Binding.create(pinned, a => a.active), "Select when the filter will take effect")}
      </td>
      <td className="sf-pinned-filter-cell">
        {canSplitValue(p.fo) &&
          <input type="checkbox" checked={pinned.splitValue ?? false}
            readOnly={p.readonly}
            className="form-check-input"
            onChange={e => { pinned.splitValue = e.currentTarget.checked; p.onChange() }}
            title={
              !canSplitValue(p.fo) ? undefined :
                !isFilterGroupOptionParsed(p.fo) && isList(p.fo.operation!) ? SearchMessage.SplitsTheValuesAndSearchesEachOneIndependentlyInAnANDGroup.niceToString() :
                  SearchMessage.SplitsTheStringValueBySpaceAndSearchesEachPartIndependentlyInAnANDGroup.niceToString()
            } />
        }
      </td>
    </>
  );

  function numericTextBox(binding: Binding<number | undefined>, title: string) {

    var val = binding.getValue();
    var numberFormat = toNumberFormat("0");

    return (
      <NumericTextBox readonly={p.readonly} value={val == undefined ? null : val} format={numberFormat} onChange={n => { binding.setValue(n == null ? undefined : n); p.onChange(); }}
        validateKey={isNumber} formControlClass="form-control form-control-xs" htmlAttributes={{ placeholder: title, style: { width: "60px" } }} />
    );
  }

  //function renderButton(binding: Binding<boolean | undefined>, label: string, title: string) {
  //  return (
  //    <button type="button" className={classes("px-1 btn btn-light", binding.getValue() && "active")} disabled={p.readonly}
  //      onClick={e => { binding.setValue(binding.getValue() ? undefined : true); p.onChange(); }}
  //      title={StyleContext.default.titleLabels ? title : undefined}>
  //      {label}
  //    </button>
  //  );
  //}

  function renderActiveDropdown(binding: Binding<PinnedFilterActive | undefined>, title: string) {
    var value = binding.getValue() ?? "Always";
    return (
      <Dropdown>
        <Dropdown.Toggle variant="light" id="dropdown-basic" disabled={p.readonly} size={"xs" as any} className="px-1"
          title={StyleContext.default.titleLabels ? title : undefined}>
          {PinnedFilterActive.niceToString(value)}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {PinnedFilterActive.values().map(v =>
            <Dropdown.Item key={v} active={v == value} onClick={() => { binding.setValue(v == "Always" ? undefined : v); p.onChange(); }}>
              {PinnedFilterActive.niceToString(v)}
            </Dropdown.Item>)
          }
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

function DashboardBehaviourComponent(p: { filter: FilterOptionParsed, readonly: boolean, onChange: () => void }) {
  return (
    <Dropdown>
      <Dropdown.Toggle variant={p.filter.dashboardBehaviour ? "info" : "light"} id="dropdown-basic" disabled={p.readonly} size={"xs" as any} className={classes("px-1", p.filter.dashboardBehaviour ? "text-light" : "text-info")}
        title={StyleContext.default.titleLabels ? "Behaviour of the filter when used inside of a Dashboard" : undefined}>
        {<FontAwesomeIcon icon="gauge" className={classes("icon", p.filter.dashboardBehaviour ? "text-light" : "text-info")} />}{p.filter.dashboardBehaviour ? " " + DashboardBehaviour.niceToString(p.filter.dashboardBehaviour) : ""}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {[undefined, ...DashboardBehaviour.values()].map(v =>
          <Dropdown.Item key={v ?? "-"} active={v == p.filter.dashboardBehaviour} onClick={() => {

            p.filter.dashboardBehaviour = v;
            if (v == "PromoteToDasboardPinnedFilter" && p.filter.pinned == null)
              p.filter.pinned = {};
            else if ((v == "UseAsInitialSelection" || v == "UseWhenNoFilters") && p.filter.pinned != null)
              p.filter.pinned = undefined;

            p.onChange();
          }}>
            {v == null ? " - " : DashboardBehaviour.niceToString(v)}
          </Dropdown.Item>)
        }
      </Dropdown.Menu>
    </Dropdown>
  );
}

export function createFilterValueControl(ctx: TypeContext<any>, token: QueryToken, handleValueChange: () => void, options: { label?: string, forceNullable?: boolean, mandatory?: boolean }): React.ReactElement<any> {

  var { label, forceNullable, mandatory } = options;

  var tokenType = token.type;
  if (forceNullable)
    tokenType = { ...tokenType, isNotNullable: false };

  switch (token.filterType) {
    case "Lite":
      if (token.key == "[EntityType]" && token.parent!.type.name != IsByAll)
        return <EntityCombo ctx={ctx} type={tokenType} create={false} onChange={handleValueChange} label={label} mandatory={mandatory} findOptions={{
          queryName: TypeEntity,
          filterOptions: [{ token: TypeEntity.token(a => a.cleanName), operation: "IsIn", value: token.parent!.type.name.split(", ") }]
        }} />;

      if (tokenType.name == IsByAll || getTypeInfos(tokenType).some(ti => !ti.isLowPopulation))
        return <EntityLine ctx={ctx} type={tokenType} create={false} onChange={handleValueChange} label={label} mandatory={mandatory} />;
      else
        return <EntityCombo ctx={ctx} type={tokenType} create={false} onChange={handleValueChange} label={label} mandatory={mandatory} />
    case "Embedded":
      return <EntityLine ctx={ctx} type={tokenType} create={false} autocomplete={null} onChange={handleValueChange} label={label} mandatory={mandatory} />;
    case "Enum":
      const ti = tryGetTypeInfos(tokenType).single();
      if (!ti)
        throw new Error(`EnumType ${tokenType.name} not found`);
      const members = Dic.getValues(ti.members).filter(a => !a.isIgnoredEnum);
      return <ValueLine ctx={ctx} type={tokenType} format={token.format} unit={token.unit} optionItems={members} onChange={handleValueChange} label={label} mandatory={mandatory} />;
    default:
      return <ValueLine ctx={ctx} type={tokenType} format={token.format} unit={token.unit} onChange={handleValueChange} label={label} mandatory={mandatory} />;
  }
}

export interface MultiValueProps {
  values: any[],
  onRenderItem: (ctx: TypeContext<any>) => React.ReactElement<any>;
  readOnly: boolean;
  onChange: () => void;
}

export function MultiValue(p: MultiValueProps) {

  const forceUpdate = useForceUpdate();

  function handleDeleteValue(e: React.MouseEvent<any>, index: number) {
    e.preventDefault();
    p.values.removeAt(index);
    p.onChange();
    forceUpdate();
  }

  function handleAddValue(e: React.MouseEvent<any>) {
    e.preventDefault();
    p.values.push(undefined);
    p.onChange();
    forceUpdate();
  }

  return (
    <table style={{ marginBottom: "0px" }} className="sf-multi-value">
      <tbody>
        {
          p.values.map((v, i) =>
            <tr key={i}>
              <td>
                {!p.readOnly &&
                  <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.DeleteFilter.niceToString() : undefined}
                    className="sf-line-button sf-remove"
                    onClick={e => handleDeleteValue(e, i)}>
                    <FontAwesomeIcon icon="xmark" />
                  </a>}
              </td>
              <td>
                {
                  p.onRenderItem(new TypeContext<any>(undefined,
                    {
                      formGroupStyle: "None",
                      formSize: "xs",
                      readOnly: p.readOnly
                    }, undefined, new Binding<any>(p.values, i)))
                }
              </td>
            </tr>)
        }
        <tr >
          <td colSpan={4}>
            {!p.readOnly &&
              <a href="#" title={StyleContext.default.titleLabels ? SearchMessage.AddValue.niceToString() : undefined}
                className="sf-line-button sf-create"
                onClick={handleAddValue}>
                <FontAwesomeIcon icon="plus" className="sf-create" />&nbsp;{SearchMessage.AddValue.niceToString()}
              </a>}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function MultiEntity(p: { values: Lite<Entity>[], readOnly: boolean, type: string, onChange: () => void, vertical?: boolean }) {
  const mListEntity = React.useRef<MList<Lite<Entity>>>([]);


  mListEntity.current.clear();
  mListEntity.current.push(...p.values.map(lite => newMListElement(lite)));

  var ctx = new TypeContext<MList<Lite<Entity>>>(undefined, { formGroupStyle: "None", readOnly: p.readOnly, formSize: "xs" }, undefined, Binding.create(mListEntity, a => a.current));


  return <EntityStrip ctx={ctx} type={{ name: p.type, isLite: true, isCollection: true }} create={false} vertical={p.vertical} onChange={() => {
    p.values.clear();
    p.values.push(...mListEntity.current.map(a => a.element));
    p.onChange();
  }} />
}


function fixDashboardBehaviour(fop: FilterOptionParsed) {
  if (fop.dashboardBehaviour == "PromoteToDasboardPinnedFilter" && fop.pinned == null)
    fop.dashboardBehaviour = undefined;

  if ((fop.dashboardBehaviour == "UseWhenNoFilters" || fop.dashboardBehaviour == "UseAsInitialSelection") && fop.pinned != null)
    fop.dashboardBehaviour = undefined;
}


export function FilterTextArea(p: { ctx: TypeContext<string>, isComplex: boolean, onChange: () => void, label?: string }) {
  return <ValueLine ctx={p.ctx}
    type={{ name: "string" }}
    label={p.label}
    valueLineType="TextArea"
    valueHtmlAttributes={p.isComplex ? {
      onKeyDown: e => {
        console.log(e);
        if (e.keyCode == 13 && !e.shiftKey) {
          e.preventDefault();
        }
      },
      onKeyUp: e => {
        console.log(e);
        if (e.keyCode == 13 && e.shiftKey) {
           e.stopPropagation() 
        }
      }
    } : undefined}
    extraButtons={p.isComplex ? (vlc => <ComplexConditionSyntax />) : undefined}
    onChange={p.onChange}
  />
}

export function ComplexConditionSyntax() {
  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Full-Text Search Syntax</Popover.Header>
      <Popover.Body>
        <ul className="ps-3">
          {ComplexConditionSyntax.examples.map((a, i) => <li key={i} style={{ whiteSpace: "nowrap" }}><code>{a}</code></li>)}
        </ul>
        <a href="https://learn.microsoft.com/en-us/sql/relational-databases/search/query-with-full-text-search" target="_blank">Microsoft Docs <FontAwesomeIcon icon="arrow-up-right-from-square" /></a>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" placement="right" overlay={popover} >
      <button className="sf-line-button sf-view btn input-group-text"><FontAwesomeIcon icon="asterisk" title="syntax" /></button>
    </OverlayTrigger>
  );

}


ComplexConditionSyntax.examples = [
  "banana AND strawberry",
  "banana OR strawberry",
  "apple AND NOT (banana OR strawberry)",
  "\"Dragon Fruit\" OR \"Passion Fruit\"",
  "*berry",
  "NEAR(\"apple\", \"orange\")",
  "NEAR((\"apple\", \"orange\"), 3)",
];



function niceNameOrSymbol(fo: FilterOperation) {
  switch (fo) {
    case "EqualTo": return "=";
    case "DistinctTo": return "≠";
    case "GreaterThan": return ">";
    case "GreaterThanOrEqual": return "≥";
    case "LessThan": return "<";
    case "LessThanOrEqual": return "≤";
    default: return FilterOperation.niceToString(fo);
  }
}
