﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.1
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
    using Signum.Engine;
    using Signum.Entities.Authorization;
    using Signum.Web.Auth;
    using Signum.Web.Extensions.Properties;
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
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("MvcRazorClassGenerator", "1.0")]
    [System.Web.WebPages.PageVirtualPathAttribute("~/AuthAdmin/Views/EntityGroups.cshtml")]
    public class _Page_AuthAdmin_Views_EntityGroups_cshtml : System.Web.Mvc.WebViewPage<dynamic>
    {
#line hidden

        public _Page_AuthAdmin_Views_EntityGroups_cshtml()
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

Write(Html.DynamicCss("~/authAdmin/Content/authAdmin.css"));

WriteLiteral("\r\n");


Write(Html.ScriptsJs("~/authAdmin/Scripts/authAdmin.js"));

WriteLiteral("\r\n<script type=\"text/javascript\">\r\n    $(function () {\r\n        magicCheckBoxes($" +
"(document));\r\n    });\r\n</script>\r\n");


 using (var tc = Html.TypeContext<EntityGroupRulePack>())
{
    
Write(Html.EntityLine(tc, f => f.Role));

                                     
    
Write(Html.ValueLine(tc, f => f.DefaultRule, vl => { vl.UnitText = tc.Value.DefaultLabel; }));

                                                                                           


WriteLiteral("    <table class=\"ruleTable\">\r\n        <thead>\r\n            <tr>\r\n               " +
" <th>\r\n                    ");


               Write(Resources.EntityGroupsAscx_EntityGroup);

WriteLiteral("\r\n                </th>\r\n                <th>\r\n                </th>\r\n           " +
"     <th>\r\n                    ");


               Write(Resources.TypesAscx_Create);

WriteLiteral("\r\n                </th>\r\n                <th>\r\n                    ");


               Write(Resources.TypesAscx_Modify);

WriteLiteral("\r\n                </th>\r\n                <th>\r\n                    ");


               Write(Resources.TypesAscx_Read);

WriteLiteral("\r\n                </th>\r\n                <th>\r\n                    ");


               Write(Resources.TypesAscx_None);

WriteLiteral("\r\n                </th>\r\n                <th>\r\n                    ");


               Write(Resources.EntityGroupsAscx_Overriden);

WriteLiteral("\r\n                </th>\r\n            </tr>\r\n        </thead>\r\n");


         foreach (var item in tc.TypeElementContext(p => p.Rules))
        {

WriteLiteral("            <tr>\r\n                <td rowspan=\"2\" style=\"vertical-align: middle\">" +
"\r\n                    ");


               Write(Html.Span(null, item.Value.Resource.Name));

WriteLiteral("\r\n                    ");


               Write(Html.HiddenRuntimeInfo(item, i => i.Resource));

WriteLiteral("\r\n                </td>\r\n                <td>\r\n                    In");


                  Write(Html.Hidden(item.Compose("InBase"), item.Value.AllowedBase.InGroup.ToStringParts()));

WriteLiteral("\r\n                </td>\r\n                <td>\r\n                    <a class=\"cbLi" +
"nk create\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("In_Create"), item.Value.Allowed.InGroup.IsActive(TypeAllowedBasic.Create), new { tag = "Create" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            <a class=\"cbLink modify\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("In_Modify"), item.Value.Allowed.InGroup.IsActive(TypeAllowedBasic.Modify), new { tag = "Modify" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            <a class=\"cbLink read\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("In_Read"), item.Value.Allowed.InGroup.IsActive(TypeAllowedBasic.Read), new { tag = "Read" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            <a class=\"cbLink none\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("In_None"), item.Value.Allowed.InGroup.IsActive(TypeAllowedBasic.None), new { tag = "None" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            ");


               Write(Html.CheckBox(item.Compose("InOverriden"), !item.Value.Allowed.InGroup.Equals(item.Value.AllowedBase.InGroup), new { disabled = "disabled", @class = "sf-overriden" }));

WriteLiteral("\r\n                </td>\r\n            </tr>\r\n");



WriteLiteral("            <tr class=\"second\">\r\n                <td>\r\n                    Out");


                   Write(Html.Hidden(item.Compose("OutBase"), item.Value.AllowedBase.OutGroup.ToStringParts()));

WriteLiteral("\r\n                </td>\r\n                <td>\r\n                    <a class=\"cbLi" +
"nk create\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("Out_Create"), item.Value.Allowed.OutGroup.IsActive(TypeAllowedBasic.Create), new { tag = "Create" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            <a class=\"cbLink modify\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("Out_Modify"), item.Value.Allowed.OutGroup.IsActive(TypeAllowedBasic.Modify), new { tag = "Modify" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            <a class=\"cbLink read\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("Out_Read"), item.Value.Allowed.OutGroup.IsActive(TypeAllowedBasic.Read), new { tag = "Read" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            <a class=\"cbLink none\">\r\n                        ");


                   Write(Html.CheckBox(item.Compose("Out_None"), item.Value.Allowed.OutGroup.IsActive(TypeAllowedBasic.None), new { tag = "None" }));

WriteLiteral("\r\n                    </a>\r\n                </td>\r\n                <td>\r\n        " +
"            ");


               Write(Html.CheckBox(item.Compose("OutOverriden"), !item.Value.Allowed.OutGroup.Equals(item.Value.AllowedBase.OutGroup), new { disabled = "disabled", @class = "sf-overriden" }));

WriteLiteral("\r\n                </td>\r\n            </tr>\r\n");


        }

WriteLiteral("    </table>\r\n");


}
WriteLiteral(" ");


        }
    }
}
