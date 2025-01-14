namespace Signum.Chart.Scripts;

public class MultiColumnsChartScript : ChartScript
{
    public MultiColumnsChartScript() : base(D3ChartScript.MultiColumns)
    {
        Icon = ChartScriptLogic.LoadIcon("multicolumns.png");
        Columns = new List<ChartScriptColumn>
        {
            new ChartScriptColumn("Horizontal Axis", ChartColumnType.Groupable),
            new ChartScriptColumn("Split Columns", ChartColumnType.Groupable) { IsOptional = true },
            new ChartScriptColumn("Height", ChartColumnType.Positionable) ,
            new ChartScriptColumn("Height 2", ChartColumnType.Positionable) { IsOptional = true },
            new ChartScriptColumn("Height 3", ChartColumnType.Positionable) { IsOptional = true },
            new ChartScriptColumn("Height 4", ChartColumnType.Positionable) { IsOptional = true },
            new ChartScriptColumn("Height 5", ChartColumnType.Positionable) { IsOptional = true }
        };
        ParameterGroups = new List<ChartScriptParameterGroup>
        {
            new ChartScriptParameterGroup()
            {
                new ChartScriptParameter("CompleteValues", ChartParameterType.Enum) { ColumnIndex = 0,  ValueDefinition = EnumValueList.Parse("Auto|Yes|No|FromFilters") },
                new ChartScriptParameter("Scale", ChartParameterType.Enum) { ColumnIndex = 2,  ValueDefinition = EnumValueList.Parse("ZeroMax (M)|MinMax|Log (M)") },
            },
            new ChartScriptParameterGroup("Margin")
            {
                new ChartScriptParameter("UnitMargin", ChartParameterType.Number) {  ValueDefinition = new NumberInterval { DefaultValue = 40m } },
            },
            new ChartScriptParameterGroup("Number")
            {
                new ChartScriptParameter("NumberOpacity", ChartParameterType.Number) {  ValueDefinition = new NumberInterval { DefaultValue = 0.8m } },
                new ChartScriptParameter("NumberColor", ChartParameterType.String) {  ValueDefinition = new StringValue("#fff") },
            },
            new ChartScriptParameterGroup("Color Category")
            {
                new ChartScriptParameter("ColorCategory", ChartParameterType.Special) {  ValueDefinition = new SpecialParameter(SpecialParameterType.ColorCategory) },
            }
        };
    }
}
