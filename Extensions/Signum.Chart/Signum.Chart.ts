//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Signum/React/Reflection'
import * as Entities from '../../Signum/React/Signum.Entities'
import * as DynamicQuery from '../../Signum/React/Signum.DynamicQuery'
import * as Basics from '../../Signum/React/Signum.Basics'
import * as Queries from '../Signum.UserAssets/Signum.UserAssets.Queries'

import { FilterOptionParsed, OrderOptionParsed, FilterRequest, OrderRequest } from '@framework/FindOptions'

//Partial
export interface ChartRequestModel {
  queryKey: string;
  
  filterOptions: FilterOptionParsed[];

  filters: FilterRequest[];
}

export interface ChartScriptParameterEmbedded {
  enumValues: { name: string, typeFilter : ChartColumnType }[];
}



export const ChartColumnEmbedded = new Type<ChartColumnEmbedded>("ChartColumnEmbedded");
export interface ChartColumnEmbedded extends Entities.EmbeddedEntity {
  Type: "ChartColumnEmbedded";
  token: Queries.QueryTokenEmbedded | null;
  displayName: string | null;
  format: string | null;
  orderByIndex: number | null;
  orderByType: DynamicQuery.OrderType | null;
}

export const ChartColumnType = new EnumType<ChartColumnType>("ChartColumnType");
export type ChartColumnType =
  "Integer" |
  "Real" |
  "DateOnly" |
  "DateTime" |
  "String" |
  "Lite" |
  "Enum" |
  "RealGroupable" |
  "Time" |
  "Magnitude" |
  "Groupable" |
  "Positionable" |
  "Any";

export module ChartMessage {
  export const _0CanOnlyBeCreatedFromTheChartWindow = new MessageKey("ChartMessage", "_0CanOnlyBeCreatedFromTheChartWindow");
  export const _0CanOnlyBeCreatedFromTheSearchWindow = new MessageKey("ChartMessage", "_0CanOnlyBeCreatedFromTheSearchWindow");
  export const Chart = new MessageKey("ChartMessage", "Chart");
  export const ChartToken = new MessageKey("ChartMessage", "ChartToken");
  export const ChartSettings = new MessageKey("ChartMessage", "ChartSettings");
  export const Dimension = new MessageKey("ChartMessage", "Dimension");
  export const DrawChart = new MessageKey("ChartMessage", "DrawChart");
  export const Group = new MessageKey("ChartMessage", "Group");
  export const Query0IsNotAllowed = new MessageKey("ChartMessage", "Query0IsNotAllowed");
  export const ToggleInfo = new MessageKey("ChartMessage", "ToggleInfo");
  export const ColorsFor0 = new MessageKey("ChartMessage", "ColorsFor0");
  export const CreatePalette = new MessageKey("ChartMessage", "CreatePalette");
  export const MyCharts = new MessageKey("ChartMessage", "MyCharts");
  export const CreateNew = new MessageKey("ChartMessage", "CreateNew");
  export const Edit = new MessageKey("ChartMessage", "Edit");
  export const ApplyChanges = new MessageKey("ChartMessage", "ApplyChanges");
  export const ViewPalette = new MessageKey("ChartMessage", "ViewPalette");
  export const ChartFor = new MessageKey("ChartMessage", "ChartFor");
  export const ChartOf0 = new MessageKey("ChartMessage", "ChartOf0");
  export const _0IsKeyBut1IsAnAggregate = new MessageKey("ChartMessage", "_0IsKeyBut1IsAnAggregate");
  export const _0ShouldBeAnAggregate = new MessageKey("ChartMessage", "_0ShouldBeAnAggregate");
  export const _0ShouldBeSet = new MessageKey("ChartMessage", "_0ShouldBeSet");
  export const _0ShouldBeNull = new MessageKey("ChartMessage", "_0ShouldBeNull");
  export const _0IsNot1 = new MessageKey("ChartMessage", "_0IsNot1");
  export const _0IsAnAggregateButTheChartIsNotGrouping = new MessageKey("ChartMessage", "_0IsAnAggregateButTheChartIsNotGrouping");
  export const _0IsNotOptional = new MessageKey("ChartMessage", "_0IsNotOptional");
  export const SavePalette = new MessageKey("ChartMessage", "SavePalette");
  export const NewPalette = new MessageKey("ChartMessage", "NewPalette");
  export const Data = new MessageKey("ChartMessage", "Data");
  export const ChooseABasePalette = new MessageKey("ChartMessage", "ChooseABasePalette");
  export const DeletePalette = new MessageKey("ChartMessage", "DeletePalette");
  export const Preview = new MessageKey("ChartMessage", "Preview");
  export const TypeNotFound = new MessageKey("ChartMessage", "TypeNotFound");
  export const Type0NotFoundInTheDatabase = new MessageKey("ChartMessage", "Type0NotFoundInTheDatabase");
  export const Reload = new MessageKey("ChartMessage", "Reload");
  export const Maximize = new MessageKey("ChartMessage", "Maximize");
  export const Minimize = new MessageKey("ChartMessage", "Minimize");
  export const ShowChartSettings = new MessageKey("ChartMessage", "ShowChartSettings");
  export const HideChartSettings = new MessageKey("ChartMessage", "HideChartSettings");
  export const QueryResultReachedMaxRows0 = new MessageKey("ChartMessage", "QueryResultReachedMaxRows0");
}

export const ChartParameterEmbedded = new Type<ChartParameterEmbedded>("ChartParameterEmbedded");
export interface ChartParameterEmbedded extends Entities.EmbeddedEntity {
  Type: "ChartParameterEmbedded";
  name: string;
  value: string | null;
}

export const ChartParameterType = new EnumType<ChartParameterType>("ChartParameterType");
export type ChartParameterType =
  "Enum" |
  "Number" |
  "String" |
  "Special";

export module ChartPermission {
  export const ViewCharting : Basics.PermissionSymbol = registerSymbol("Permission", "ChartPermission.ViewCharting");
}

export const ChartRequestModel = new Type<ChartRequestModel>("ChartRequestModel");
export interface ChartRequestModel extends Entities.ModelEntity {
  Type: "ChartRequestModel";
  chartScript: ChartScriptSymbol;
  columns: Entities.MList<ChartColumnEmbedded>;
  parameters: Entities.MList<ChartParameterEmbedded>;
  maxRows: number | null;
}

export const ChartScriptSymbol = new Type<ChartScriptSymbol>("ChartScript");
export interface ChartScriptSymbol extends Basics.Symbol {
  Type: "ChartScript";
}

export module D3ChartScript {
  export const Bars : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Bars");
  export const Columns : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Columns");
  export const Line : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Line");
  export const MultiBars : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.MultiBars");
  export const MultiColumns : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.MultiColumns");
  export const MultiLines : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.MultiLines");
  export const StackedBars : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.StackedBars");
  export const StackedColumns : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.StackedColumns");
  export const StackedLines : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.StackedLines");
  export const Pie : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Pie");
  export const BubblePack : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.BubblePack");
  export const Scatterplot : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Scatterplot");
  export const Bubbleplot : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Bubbleplot");
  export const ParallelCoordinates : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.ParallelCoordinates");
  export const Punchcard : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Punchcard");
  export const CalendarStream : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.CalendarStream");
  export const Treemap : ChartScriptSymbol = registerSymbol("ChartScript", "D3ChartScript.Treemap");
}

export module GoogleMapsChartScript {
  export const Heatmap : ChartScriptSymbol = registerSymbol("ChartScript", "GoogleMapsChartScript.Heatmap");
  export const Markermap : ChartScriptSymbol = registerSymbol("ChartScript", "GoogleMapsChartScript.Markermap");
}

export module HtmlChartScript {
  export const PivotTable : ChartScriptSymbol = registerSymbol("ChartScript", "HtmlChartScript.PivotTable");
}

export const SpecialParameterType = new EnumType<SpecialParameterType>("SpecialParameterType");
export type SpecialParameterType =
  "ColorCategory" |
  "ColorInterpolate";

export module SvgMapsChartScript {
  export const SvgMap : ChartScriptSymbol = registerSymbol("ChartScript", "SvgMapsChartScript.SvgMap");
}

