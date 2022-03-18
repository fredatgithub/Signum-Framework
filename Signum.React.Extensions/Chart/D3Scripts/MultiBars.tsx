import * as React from 'react'
import * as d3 from 'd3'
import * as ChartUtils from './Components/ChartUtils';
import { translate, scale, rotate, skewX, skewY, matrix, scaleFor } from './Components/ChartUtils';
import { PivotRow, toPivotTable, groupedPivotTable } from './Components/PivotTable';
import { ChartTable, ChartColumn, ChartScriptProps } from '../ChartClient';
import Legend from './Components/Legend';
import TextEllipsis from './Components/TextEllipsis';
import { XScaleTicks, YKeyTicks } from './Components/Ticks';
import { XAxis, YAxis } from './Components/Axis';
import { Rule } from './Components/Rule';
import InitialMessage from './Components/InitialMessage';
import TextIfFits from './Components/TextIfFits';


export default function renderMultiBars({ data, width, height, parameters, loading, onDrillDown, initialLoad, chartRequest, memo, dashboardFilter }: ChartScriptProps): React.ReactElement<any> {

  var xRule = Rule.create({
    _1: 5,
    title: 15,
    _2: 10,
    labels: parseInt(parameters["LabelMargin"]),
    _3: 5,
    ticks: 4,
    content: '*',
    _4: 10,
  }, width);
  //xRule.debugX(chart)

  var yRule = Rule.create({
    _1: 10,
    legend: 15,
    _2: 5,
    content: '*',
    ticks: 4,
    _3: 5,
    labels: 10,
    _4: 10,
    title: 15,
    _5: 5,
  }, height);
  //yRule.debugY(chart);

  if (data == null || data.rows.length == 0)
    return (
      <svg direction="ltr" width={width} height={height}>
        <InitialMessage data={data} x={xRule.middle("content")} y={yRule.middle("content")} loading={loading} />
        <XAxis xRule={xRule} yRule={yRule} />
        <YAxis xRule={xRule} yRule={yRule} />
      </svg>
    );

  var c = data.columns;
  var keyColumn = c.c0 as ChartColumn<unknown>;
  var valueColumn0 = c.c2 as ChartColumn<number>;

  var pivot = c.c1 == null ?
    toPivotTable(data, c.c0!, [c.c2, c.c3, c.c4, c.c5, c.c6].filter(cn => cn != undefined) as ChartColumn<number>[]) :
    groupedPivotTable(data, c.c0!, c.c1, c.c2 as ChartColumn<number>);

  var allValues = pivot.rows.flatMap(r => pivot.columns.map(function (c) { return r.values[c.key] && r.values[c.key].value; }));

  var x = scaleFor(valueColumn0, allValues, 0, xRule.size('content'), parameters["Scale"]);

  var keyValues = ChartUtils.completeValues(keyColumn, pivot.rows.map(r => r.rowValue), parameters['CompleteValues'], chartRequest.filterOptions, ChartUtils.insertPoint(keyColumn, valueColumn0));

  var y = d3.scaleBand()
    .domain(keyValues.map(v => keyColumn.getKey(v)))
    .range([0, yRule.size('content')]);

  var interMagin = 2;

  var columnsInOrder = pivot.columns.orderBy(a => a.key);
  var rowsInOrder = pivot.rows.orderBy(r => keyColumn.getKey(r.rowValue));
  var color = ChartUtils.colorCategory(parameters, columnsInOrder.map(s => s.key), memo);

  var ySubscale = d3.scaleBand()
    .domain(pivot.columns.map(s => s.key))
    .range([interMagin, y.bandwidth() - interMagin]);

  var detector = dashboardFilter?.getActiveDetector(chartRequest);

  return (
    <svg direction="ltr" width={width} height={height}>
      <g opacity={dashboardFilter ? .5 : undefined}>
        <XScaleTicks xRule={xRule} yRule={yRule} valueColumn={valueColumn0} x={x} />
      </g>
      <YKeyTicks xRule={xRule} yRule={yRule} keyValues={keyValues} keyColumn={keyColumn} y={y} showLabels={true} isActive={detector && (val => detector!({ c0: val }))} onDrillDown={(v, e) => onDrillDown({ c0: v }, e)} />

      {columnsInOrder.map(s => <g key={s.key} className="shape-serie"
        transform={translate(xRule.start('content'), yRule.end('content'))} >

        {
          rowsInOrder
            .filter(r => r.values[s.key] != undefined)
            .map(r => {
              var row = r.values[s.key];
              if (row == undefined)
                return undefined;

              var active = detector?.(row.rowClick);
              var key = keyColumn.getKey(r.rowValue);


              return (
                <g className="shadow-group" key={key}>
                  <rect className="shape sf-transition shadow"
                    opacity={active == false ? .5 : undefined}
                    fill={s.color || color(s.key)}
                    transform={translate(0, -y(key)! - ySubscale(s.key)! - ySubscale.bandwidth()) + (initialLoad ? scale(0, 1) : scale(1, 1))}
                    height={ySubscale.bandwidth()}
                    width={x(row.value)}
                    onClick={e => onDrillDown(row.rowClick, e)}
                    cursor="pointer">
                    <title>
                      {row.valueTitle}
                    </title>
                  </rect>
                  {
                    ySubscale.bandwidth() > 15 && parseFloat(parameters["NumberOpacity"]) > 0 &&
                    <TextIfFits className="number-label sf-transition"
                      maxWidth={x(r.values[s.key]?.value)}
                      transform={translate(
                        x(r.values[s.key]?.value)! / 2,
                        -y(keyColumn.getKey(r.rowValue))! - ySubscale(s.key)! - ySubscale.bandwidth() / 2
                      )}
                      onClick={e => onDrillDown(r.values[s.key].rowClick, e)}
                      opacity={parameters["NumberOpacity"]}
                      fill={parameters["NumberColor"]}
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontWeight="bold">
                      {r.values[s.key].valueNiceName}
                      <title>
                        {r.values[s.key].valueTitle}
                      </title>
                    </TextIfFits>
                  }

                </g>
              )
            })
        }

      </g>)}

      <Legend pivot={pivot} xRule={xRule} yRule={yRule} color={color} isActive={c.c1 && detector && (row => detector!({ c1: row.value }))} onDrillDown={c.c1 && ((s, e) => onDrillDown({ c1: s.value }, e))} />

      <InitialMessage data={data} x={xRule.middle("content")} y={yRule.middle("content")} loading={loading} />
      <g opacity={dashboardFilter ? .5 : undefined}>
        <XAxis xRule={xRule} yRule={yRule} />
        <YAxis xRule={xRule} yRule={yRule} />
      </g>
    </svg>
  );
}
