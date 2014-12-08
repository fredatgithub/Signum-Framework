﻿using Signum.Engine;
using Signum.Engine.Basics;
using Signum.Engine.DynamicQuery;
using Signum.Engine.Mailing;
using Signum.Engine.Operations;
using Signum.Entities;
using Signum.Entities.DynamicQuery;
using Signum.Entities.Mailing;
using Signum.Utilities;
using Signum.Web.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Signum.Web.Operations;

namespace Signum.Web.Word
{
    public class WordController : Controller
    {
        [HttpPost]
        public ContentResult NewSubTokensCombo(string webQueryName, string tokenName, string prefix, int options)
        {
            object queryName = Finder.ResolveQueryName(webQueryName);
            QueryDescription qd = DynamicQueryManager.Current.QueryDescription(queryName);
            var token = QueryUtils.Parse(tokenName, qd, (SubTokensOptions)options);

            var combo = FinderController.CreateHtmlHelper(this)
                .QueryTokenBuilderOptions(token, new Context(null, prefix), WordClient.GetQueryTokenBuilderSettings(qd, (SubTokensOptions)options));

            return Content(combo.ToHtmlString());
        }

        [HttpPost]
        public ActionResult CreateWordReportFromTemplateAndEntity()
        {
            var entity = Lite.Parse(Request["keys"]).Retrieve();

            var emailMessage = this.ExtractEntity<EmailTemplateEntity>()
                .ConstructFrom(EmailMessageOperation.CreateMailFromTemplate, entity);

            return this.DefaultConstructResult(emailMessage);
        }
    }
}
