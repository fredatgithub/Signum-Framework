import * as React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import * as AppContext from '@framework/AppContext'
import * as Navigator from '@framework/Navigator'
import { API, Urls } from '../HelpClient'
import * as Operations from '@framework/Operations';
import { useForceUpdate, useAPIWithReload } from '@framework/Hooks';
import { HelpMessage, NamespaceHelpEntity, NamespaceHelpOperation, AppendixHelpEntity, AppendixHelpOperation } from '../Signum.Help';
import { getTypeInfo, GraphExplorer, symbolNiceName } from '@framework/Reflection';
import { JavascriptMessage, Entity, toLite, OperationMessage, getToString } from '@framework/Signum.Entities';
import { TypeContext } from '@framework/Lines';
import { EditableComponent } from './EditableText';
import { notifySuccess } from '@framework/Operations';
import { getOperationInfo } from '@framework/Operations';
import MessageModal from '@framework/Modals/MessageModal';
import { classes } from '@framework/Globals';
import { useTitle } from '@framework/AppContext'


export default function AppendixHelpHelp() {
  const params = useParams() as { uniqueName: string | undefined };

  var [appendix, reloadAppendix] = useAPIWithReload(() => API.appendix(params.uniqueName), []);
  useTitle(HelpMessage.Help.niceToString() + (appendix && (" > " + appendix.title)));
  var forceUpdate = useForceUpdate();
  if (appendix == null)
    return <h1 className="display-6">{JavascriptMessage.loading.niceToString()}</h1>;

  var ctx = TypeContext.root(appendix, { readOnly: Navigator.isReadOnly(AppendixHelpEntity) });

  return (
    <div>
      <h1 className="display-6"><Link to={Urls.indexUrl()}>
        {HelpMessage.Help.niceToString()}</Link>
        {" > "}
        <EditableComponent ctx={ctx.subCtx(a => a.title)} inline onChange={forceUpdate} defaultEditable={appendix.isNew} />
      </h1>
      <EditableComponent ctx={ctx.subCtx(a => a.uniqueName)} onChange={forceUpdate} defaultEditable={appendix.isNew} />
      <EditableComponent ctx={ctx.subCtx(a => a.description)} markdown onChange={forceUpdate} defaultEditable={appendix.isNew} />
      <div className={classes("btn-toolbar", "sf-button-bar")}>
        {ctx.value.modified && <SaveButton ctx={ctx} onSuccess={a => ctx.value.isNew ? AppContext.navigate(Urls.appendixUrl(a.uniqueName)) : reloadAppendix()} />}
        <DeleteButton ctx={ctx} />
      </div>
    </div>
  );
}

function SaveButton({ ctx, onSuccess }: { ctx: TypeContext<AppendixHelpEntity>, onSuccess: (a: AppendixHelpEntity) => void }) {

  const oi = Operations.tryGetOperationInfo(AppendixHelpOperation.Save, AppendixHelpEntity)

  if (!oi)
    return null;

  function onClick() {
    Operations.API.executeEntity(ctx.value, AppendixHelpOperation.Save)
      .then(p => {
        onSuccess(p.entity);
        notifySuccess();
      });
  }

  return <button className="btn btn-primary" onClick={onClick}>{oi.niceName}</button>;
}

function DeleteButton({ ctx }: { ctx: TypeContext<AppendixHelpEntity> }) {

  if (!Operations.tryGetOperationInfo(AppendixHelpOperation.Delete, AppendixHelpEntity))
    return null;

  function onClick() {
    MessageModal.show({
      title: OperationMessage.Confirm.niceToString(),
      message: OperationMessage.PleaseConfirmYouWouldLikeToDelete0FromTheSystem.niceToString().formatHtml(<strong>{getToString(ctx.value)}</strong>),
      buttons: "yes_no",
      icon: "warning",
      style: "warning",
    }).then(result => {
      if (result == "yes") {

        Operations.API.deleteLite(toLite(ctx.value), AppendixHelpOperation.Delete.key)
          .then((() => {
            AppContext.navigate(Urls.indexUrl());
            notifySuccess();
          }));
      }
    });
  }

  return <button className="btn btn-danger" onClick={onClick}>{getOperationInfo(AppendixHelpOperation.Delete, AppendixHelpEntity).niceName}</button>;
}
