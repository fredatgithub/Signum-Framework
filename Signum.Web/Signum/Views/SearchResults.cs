﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.269
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
    using System.Web.Mvc;
    using System.Web.Mvc.Ajax;
    using System.Web.Mvc.Html;
    using System.Web.Routing;
    using Signum.Utilities;
    using Signum.Entities;
    using Signum.Web;
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
    using Signum.Entities.DynamicQuery;
    using Signum.Entities.Reflection;
    using Signum.Web.Properties;
    using Signum.Engine;
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("MvcRazorClassGenerator", "1.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/Signum/Views/SearchResults.cshtml")]
    public class _Page_Signum_Views_SearchResults_cshtml : System.Web.Mvc.WebViewPage<Context>
    {


        public _Page_Signum_Views_SearchResults_cshtml()
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


   
   QueryDescription queryDescription = (QueryDescription)ViewData[ViewDataKeys.QueryDescription];
   var entityColumn = queryDescription.Columns.SingleEx(a => a.IsEntity);
   Type entitiesType = Lite.Extract(entityColumn.Type);
   Implementations implementations = entityColumn.Implementations.Value;
   bool viewable = (bool)ViewData[ViewDataKeys.View] && (implementations.IsByAll ? true : implementations.Types.Any(t => Navigator.IsViewable(t, EntitySettingsContext.Admin)));
   bool? allowMultiple = (bool?)ViewData[ViewDataKeys.AllowMultiple];

   FilterMode filterMode = (FilterMode)ViewData[ViewDataKeys.FilterMode];
   
   ResultTable queryResult = (ResultTable)ViewData[ViewDataKeys.Results];
   Dictionary<int, CellFormatter> formatters = (Dictionary<int, CellFormatter>)ViewData[ViewDataKeys.Formatters];

   int columnsCount = queryResult.Columns.Count() + (viewable ? 1 : 0) + (allowMultiple.HasValue ? 1 : 0);


WriteLiteral("\r\n");


 if (ViewData.ContainsKey(ViewDataKeys.MultipliedMessage))
{ 

WriteLiteral("    <tr class=\"sf-tr-multiply\">\r\n        <td class=\"sf-td-multiply ui-state-highl" +
"ight\" colspan=\"");


                                                          Write(columnsCount);

WriteLiteral("\">\r\n            <span class=\"ui-icon ui-icon-info\" style=\"float: left; margin-rig" +
"ht: .3em;\"></span>\r\n            ");


       Write(ViewData[ViewDataKeys.MultipliedMessage]);

WriteLiteral("\r\n        </td>\r\n    </tr>\r\n");


}

WriteLiteral("\r\n");


 foreach (var row in queryResult.Rows)
{
    Lite entityField = row.Entity;

WriteLiteral("    <tr data-entity=\"");


                Write(entityField.Key());

WriteLiteral("\">\r\n");


         if (allowMultiple.HasValue)
        {

WriteLiteral("            <td>\r\n");


                 if (allowMultiple.Value)
                {
                    
               Write(Html.CheckBox(
                        Model.Compose("rowSelection", row.Index.ToString()),
                          new { value = entityField.Id.ToString() + "__" + Navigator.ResolveWebTypeName(entityField.RuntimeType) + "__" + entityField.ToString() }));

                                                                                                                                                                   ;

                }
                else
                {
                    
               Write(Html.RadioButton(
                             Model.Compose("rowSelection"),
                        entityField.Id.ToString() + "__" + Navigator.ResolveWebTypeName(entityField.RuntimeType) + "__" + entityField.ToString()));

                                                                                                                                                 ;
                }

WriteLiteral("            </td>\r\n");


        }


         if (viewable)
        {

WriteLiteral("            <td>\r\n                ");


           Write(QuerySettings.EntityFormatRules.Last(fr => fr.IsApplyable(entityField)).Formatter(Html, entityField));

WriteLiteral("\r\n            </td>\r\n");


        }


         foreach (var col in queryResult.Columns)
        {
            var value = row[col];
            var ft = formatters[col.Index];
            

WriteLiteral("            <td ");


           Write(ft.WriteDataAttribute(value));

WriteLiteral(">\r\n                ");


           Write(ft.Formatter(Html, value));

WriteLiteral("\r\n            </td>\r\n");


        }

WriteLiteral("    </tr>\r\n");


}

WriteLiteral("\r\n");


 if (queryResult.Rows.IsNullOrEmpty())
{

WriteLiteral("    <tr>\r\n        <td colspan=\"");


                Write(columnsCount);

WriteLiteral("\">");


                               Write(Resources.Signum_noResults);

WriteLiteral("</td>\r\n    </tr>\r\n");


}

WriteLiteral("\r\n");


   
    ViewData[ViewDataKeys.ElementsPerPage] = queryResult.ElementsPerPage;
    ViewData[ViewDataKeys.SearchControlColumnsCount] = columnsCount;



Write(Html.Partial(Navigator.Manager.PaginationView, Model));

WriteLiteral("\r\n");


        }
    }
}
