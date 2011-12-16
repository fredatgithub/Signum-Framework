﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.239
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ASP
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Web;
    using System.Web.Helpers;
    using System.Web.Security;
    using System.Web.UI;
    using System.Web.WebPages;
    using System.Collections;
    using System.Collections.Specialized;
    using System.ComponentModel.DataAnnotations;
    using System.Configuration;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Web.Caching;
    using System.Web.DynamicData;
    using System.Web.SessionState;
    using System.Web.Profile;
    using System.Web.UI.WebControls;
    using System.Web.UI.WebControls.WebParts;
    using System.Web.UI.HtmlControls;
    using System.Xml.Linq;
    using System.Web.Mvc;
    using System.Web.Mvc.Ajax;
    using System.Web.Mvc.Html;
    using System.Web.Routing;
    using Signum.Utilities;
    using Signum.Entities;
    using Signum.Web;
    using Signum.Web.Extensions.Properties;
    using Signum.Entities.DynamicQuery;
    using Signum.Engine.DynamicQuery;
    using Signum.Entities.Reflection;
    using Signum.Entities.Chart;
    using Signum.Web.Chart;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("MvcRazorClassGenerator", "1.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/Chart/Views/ChartControl.cshtml")]
    public class _Page_Chart_Views_ChartControl_cshtml : System.Web.Mvc.WebViewPage<TypeContext<ChartRequest>>
    {


        public _Page_Chart_Views_ChartControl_cshtml()
        {
        }
        protected System.Web.HttpApplication ApplicationInstance
        {
            get
            {
                return ((System.Web.HttpApplication)(Context.ApplicationInstance));
            }
        }
        public override void Execute()
        {










WriteLiteral("\r\n");


Write(Html.ScriptCss("~/Chart/Content/SF_Chart.css"));

WriteLiteral("\r\n\r\n");


Write(Html.ScriptsJs("~/Chart/Scripts/SF_Chart.js",
                "~/scripts/d3/d3.min.js",
                "~/scripts/d3/d3.geom.min.js",
                "~/scripts/d3/d3.layout.min.js"));

WriteLiteral("\r\n\r\n");


   
    QueryDescription queryDescription = (QueryDescription)ViewData[ViewDataKeys.QueryDescription];
    List<FilterOption> filterOptions = (List<FilterOption>)ViewData[ViewDataKeys.FilterOptions];
    bool viewable = (bool)ViewData[ViewDataKeys.View];
    
    var entityColumn = queryDescription.Columns.SingleEx(a => a.IsEntity);
    Type entitiesType = Reflector.ExtractLite(entityColumn.Type);


WriteLiteral("\r\n<div id=\"");


    Write(Model.Compose("divChartControl"));

WriteLiteral("\" class=\"sf-search-control sf-chart-control\" data-subtokens-url=\"");


                                                                                                      Write(Url.Action("NewSubTokensCombo", "Chart"));

WriteLiteral("\" data-add-filter-url=\"");


                                                                                                                                                                      Write(Url.Action("AddFilter", "Chart"));

WriteLiteral("\" data-prefix=\"");


                                                                                                                                                                                                                      Write(Model.ControlID);

WriteLiteral("\" >\r\n    ");


Write(Html.HiddenRuntimeInfo(Model));

WriteLiteral("\r\n    ");


Write(Html.HiddenRuntimeInfo(Model, cr => cr.Chart));

WriteLiteral("\r\n    ");


Write(Html.Hidden(Model.Compose(ViewDataKeys.QueryName), Navigator.ResolveWebQueryName(queryDescription.QueryName)));

WriteLiteral("\r\n    <div>\r\n        <div class=\"sf-fields-list\">\r\n            <div class=\"ui-wid" +
"get sf-filters\">\r\n                <div class=\"ui-widget-header ui-corner-top sf-" +
"filters-body\">\r\n                    ");


               Write(Html.ChartRootTokens(Model.Value.Chart, queryDescription, Model));

WriteLiteral("\r\n                    \r\n                    ");


               Write(Html.Href(
                            Model.Compose("btnAddFilter"),
                            Signum.Web.Properties.Resources.FilterBuilder_AddFilter,
                            "",
                            Signum.Web.Properties.Resources.Signum_selectToken,
                            "sf-query-button sf-add-filter sf-disabled",
                            new Dictionary<string, object> 
                            { 
                                { "data-icon", "ui-icon-arrowthick-1-s" },
                                { "data-url", Url.SignumAction("AddFilter") }
                            }));

WriteLiteral("\r\n                </div>  \r\n");


                   
                    Html.RenderPartial(Navigator.Manager.FilterBuilderView); 
                

WriteLiteral("            </div>\r\n        </div>\r\n    </div>\r\n\r\n");


     using (var chart = Model.SubContext(cr => cr.Chart))
    {
        Html.RenderPartial(ChartClient.ChartBuilderView, chart);
    }

WriteLiteral("    <div class=\"sf-query-button-bar\">\r\n        <button type=\"submit\" class=\"sf-qu" +
"ery-button sf-chart-draw\" data-icon=\"ui-icon-pencil\" id=\"");


                                                                                              Write(Model.Compose("qbDraw"));

WriteLiteral("\" data-url=\"");


                                                                                                                                   Write(Url.Action<ChartController>(cc => cc.Draw(Model.ControlID)));

WriteLiteral("\">");


                                                                                                                                                                                                  Write(Resources.Chart_Draw);

WriteLiteral("</button>\r\n        ");


   Write(ChartClient.GetChartMenu(this.ViewContext, queryDescription.QueryName, entitiesType, Model.ControlID).ToString(Html));

WriteLiteral("\r\n    </div>\r\n    \r\n    <div class=\"clearall\"></div>\r\n\r\n    <div id=\"");


        Write(Model.Compose("divResults"));

WriteLiteral("\" class=\"ui-widget ui-corner-all sf-search-results-container\">\r\n");


           Html.RenderPartial(ChartClient.ChartResultsView); 

WriteLiteral("    </div>\r\n</div>");


        }
    }
}
