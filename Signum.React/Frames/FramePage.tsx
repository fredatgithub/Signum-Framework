import * as React from 'react'
import * as AppContext from '../AppContext'
import * as Navigator from '../Navigator'
import * as Constructor from '../Constructor'
import { useLocation, useParams, unstable_useBlocker } from "react-router-dom"
import * as Finder from '../Finder'
import { ButtonBar, ButtonBarHandle } from './ButtonBar'
import { Entity, Lite, getToString, EntityPack, JavascriptMessage, entityInfo, SelectorMessage, is, ModifiableEntity } from '../Signum.Entities'
import { TypeContext, StyleOptions, EntityFrame, ButtonBarElement } from '../TypeContext'
import { getTypeInfo, TypeInfo, PropertyRoute, ReadonlyBinding, GraphExplorer, parseId, OperationType } from '../Reflection'
import { renderWidgets,  WidgetContext } from './Widgets'
import { ValidationErrors, ValidationErrorsHandle } from './ValidationErrors'
import { ErrorBoundary } from '../Components';
import "./Frames.css"
import { AutoFocus } from '../Components/AutoFocus';
import { useStateWithPromise, useForceUpdate, useMounted, useDocumentEvent, useWindowEvent, useUpdatedRef } from '../Hooks'
import * as Operations from '../Operations'
import WidgetEmbedded from './WidgetEmbedded'
import { useTitle } from '../AppContext'
import { FunctionalAdapter } from '../Modals'
import { QueryString } from '../QueryString'
import { classes } from '../Globals'

interface FramePageState {
  pack: EntityPack<Entity>;
  lastEntity: string;
  getComponent: (ctx: TypeContext<Entity>) => React.ReactElement<any>;
  refreshCount: number;
  createNew?: () => Promise<EntityPack<Entity> | undefined>;
  executing?: boolean;
}

export default function FramePage() {

  let [state, setState] = useStateWithPromise<FramePageState | undefined>(undefined);
  const stateRef = useUpdatedRef(state);
  const buttonBar = React.useRef<ButtonBarHandle>(null);
  const entityComponent = React.useRef<React.Component | null>(null);
  const validationErrors = React.useRef<React.Component>(null);
  const mounted = useMounted();
  const forceUpdate = useForceUpdate();
  const params = useParams<{ type: string; id?: string }>();
  const location = useLocation();

  const ti = getTypeInfo(params.type!);
  const type = ti.name;
  const id = params.id;

  if (state && state.pack.entity.Type != ti.name)
    state = undefined;

  if (state && id != null && state.pack.entity.id != id)
    state = undefined;

  useTitle(getToString(state?.pack.entity) ?? "", [state?.pack.entity]);

  useLooseChanges(state && !state.executing ? ({ entity: state.pack.entity, lastEntity: state.lastEntity }) : undefined);

  function setPack(pack: EntityPack<Entity>, getComponent: (ctx: TypeContext<Entity>) => React.ReactElement<any>, createNew?: () => Promise<EntityPack<Entity> | undefined>) {
    return setState({
      pack,
      lastEntity: JSON.stringify(pack.entity),
      getComponent,
      createNew: createNew,
      refreshCount: state ? state.refreshCount + 1 : 0
    });
  }

  React.useEffect(() => {

    var currentEntity = stateRef.current?.pack.entity;

    if (currentEntity && currentEntity.Type == type && currentEntity.id == id)
      return;

    loadEntity()
      .then(a => {
        if (a == undefined) {
          Navigator.NavigatorManager.onFramePageCreationCancelled();
        }
        else {

          loadComponent(a.pack!).then(getComponent => {
            if (!mounted.current)
              return undefined;

            return setPack(a.pack!, getComponent, a.createNew).then(() => {
              if (id == null && a.pack!.entity.id != null) { //Constructor returns saved entity
                AppContext.navigate(Navigator.navigateRoute(a.pack!.entity), { replace : true });
              }
            })
          });
        }
      });
  }, [type, id, location.search]);


  useWindowEvent("beforeunload", e => {
    if (stateRef.current && hasChanges(stateRef.current)) {
      e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      e.returnValue = '';   // Chrome requires returnValue to be set
    }
  }, []);

  useWindowEvent("keydown", handleKeyDown, []);

  function handleKeyDown(e: KeyboardEvent) {
    if (!e.openedModals && buttonBar.current)
      buttonBar.current.handleKeyDown(e);
  }

  function loadComponent(pack: EntityPack<Entity>): Promise<(ctx: TypeContext<Entity>) => React.ReactElement<any>> {
    const viewName = QueryString.parse(location.search).viewName ?? undefined;
    return Navigator.getViewPromise(pack.entity, viewName).promise;
  }


  function loadEntity(): Promise<undefined | { pack: EntityPack<Entity>, createNew?: () => Promise<EntityPack<Entity> | undefined> }> {

    const queryString = QueryString.parse(location.search);

    if (queryString.waitOpenerData) {
      if (window.opener!.dataForChildWindow == undefined) {
        throw new Error("No dataForChildWindow in parent found!")
      }

      var pack = window.opener!.dataForChildWindow as EntityPack<Entity>;
      window.opener!.dataForChildWindow = undefined;
      var txt = JSON.stringify(pack);
      return Promise.resolve({
        pack,
        createNew: () => Promise.resolve(JSON.parse(txt))
      });
    }

    if (queryString.waitCurrentData) {
      if (window.dataForCurrentWindow == undefined) {
        throw new Error("No dataForChildWindow in parent found!")
      }

      var pack = window.dataForCurrentWindow as EntityPack<Entity>;
      window.dataForCurrentWindow = undefined;
      var txt = JSON.stringify(pack);
      return Promise.resolve({
        pack,
        createNew: () => Promise.resolve(JSON.parse(txt))
      });
    }

    if (id) {

      const lite: Lite<Entity> = {
        EntityType: ti.name,
        id: parseId(ti, id!),
      };

      return Navigator.API.fetchEntityPack(lite)
        .then(pack => {
          return Promise.resolve({
            pack,
            createNew: undefined
          });
        });

    } else {
      const cn = queryString["constructor"];
      if (cn != null && typeof cn == "string") {
        const oi = Operations.operationInfos(ti).single(a => a.operationType == "Constructor" && a.key.toLowerCase().endsWith(cn.toLowerCase()));
        return Operations.API.construct(ti.name, oi.key)
          .then(pack => {
            if (pack == undefined)
              return undefined;
            else
              return ({
                pack: pack,
                createNew: () => Operations.API.construct(ti.name, oi.key)
              });
          });
      }

      return Constructor.constructPack(ti.name)
        .then(pack => {
          if (pack == undefined)
            return undefined;
          else
            return ({
              pack: pack! as EntityPack<Entity>,
              createNew: () => Constructor.constructPack(ti.name) as Promise<EntityPack<Entity>>
            });
        });
    }
  }

  function onClose() {
    if (Finder.isFindable(params.type!, true))
      AppContext.navigate(Finder.findOptionsPath({ queryName: params.type! }));
    else
      AppContext.navigate("/");
  }

  function setComponent(c: React.Component | null) {
    if (c && entityComponent.current != c) {
      entityComponent.current = c;
      forceUpdate();
    }
  }

  if (!state) {
    return (
      <div className="normal-control">
        {renderTitle()}
      </div>
    );
  }

  const entity = state.pack.entity;

  const s = state;

  const frame: EntityFrame = {
    tabs: undefined,
    frameComponent: { forceUpdate, type: FramePage },
    entityComponent: entityComponent.current,
    pack: state.pack,
    isExecuting: () => s.executing == true,
    execute: async action => {
      if (s.executing)
        return;

      s.executing = true;
      forceUpdate();
      try {
        await action();
      } finally {
        s.executing = undefined;
        forceUpdate();
      }
    },
    onReload: (pack, reloadComponent, callback) => {

      var packEntity = (pack ?? s.pack) as EntityPack<Entity>;

      const replaceRoute = !packEntity.entity.isNew && entity.isNew;

      var newRoute = is(packEntity.entity, entity) ? null :
        packEntity.entity.isNew ? Navigator.createRoute(packEntity.entity.Type) :
        Navigator.navigateRoute(packEntity.entity);

      if (reloadComponent) {
        setState(undefined)
          .then(() => loadComponent(packEntity))
          .then(gc => {
            if (mounted.current) {
              setPack(packEntity, gc).then(() => {
                if (newRoute) {
                  if (replaceRoute)
                    AppContext.navigate(newRoute, { replace : true });
                  else
                    AppContext.navigate(newRoute);
                }

                callback && callback();
              });
            }
          });
      }
      else {
        setPack(packEntity, s.getComponent).then(() => {
          if (newRoute) {
            if (replaceRoute)
              AppContext.navigate(newRoute, { replace : true });
            else
              AppContext.navigate(newRoute);
          }

          callback && callback();
        });
      }
    },
    onClose: () => onClose(),
    revalidate: () => validationErrors.current && validationErrors.current.forceUpdate(),
    setError: (ms, initialPrefix) => {
      GraphExplorer.setModelState(entity, ms, initialPrefix || "");
      forceUpdate()
    },
    refreshCount: state.refreshCount,
    createNew: state.createNew,
    allowExchangeEntity: true,
    prefix: "framePage"
  };


  const styleOptions: StyleOptions = {
    readOnly: Navigator.isReadOnly(state.pack),
    frame: frame
  };

  const ctx = new TypeContext<Entity>(undefined, styleOptions, PropertyRoute.root(ti), new ReadonlyBinding(entity, "framePage"));
  const settings = Navigator.getSettings(ti);

  const wc: WidgetContext<Entity> = { ctx: ctx, frame: frame };

  var outdated = !state.pack.entity.isNew && (state.pack.entity.Type != type || state.pack.entity.id != id);

  return (
    <div className="normal-control" style={{ opacity: outdated ? .5 : undefined }}>
      {renderTitle()}
      <div style={state.executing == true ? { opacity: ".7" } : undefined}>
        <div className="sf-button-widget-container">
          {entityComponent.current && <ButtonBar ref={buttonBar} frame={frame} pack={state.pack} />}
        </div>
        <ValidationErrors ref={validationErrors} entity={state.pack.entity} prefix="framePage" />
        <WidgetEmbedded widgetContext={wc} >
          <div className="sf-main-control" data-refresh-count={state.refreshCount} data-main-entity={entityInfo(ctx.value)}>
            <ErrorBoundary>
              {state.getComponent && <AutoFocus>{FunctionalAdapter.withRef(state.getComponent(ctx), c => setComponent(c))}</AutoFocus>}
            </ErrorBoundary>
          </div>
        </WidgetEmbedded>
      </div>
    </div>
  );

  function renderTitle() {

    if (!state)
      return <h3 className="display-6 sf-entity-title">{JavascriptMessage.loading.niceToString()}</h3>;

    const entity = state.pack.entity;
    const title = getToString(entity);
    const subTitle = Navigator.getTypeSubTitle(entity, undefined);
    const widgets = renderWidgets(wc, settings?.stickyHeader);

    return (
      <h4 className={classes("border-bottom pb-3 mb-2", settings?.stickyHeader && "sf-sticky-header")} >
        {title && <>
          <span className="sf-entity-title">{title}</span>&nbsp;
        </>
        }
        {(subTitle || widgets) &&
          <div className="sf-entity-sub-title mt-2">
            {subTitle && <small className="sf-type-nice-name text-muted"> {subTitle}</small>}
            {widgets}
            <br />
          </div>
        }
      </h4>
    );
  }
}

function hasChanges(state: FramePageState) {

  if (state.executing)
    return false;

  const entity = state.pack.entity;
  const ge = GraphExplorer.propagateAll(entity);
  if (entity.modified && JSON.stringify(entity) != state.lastEntity) {
    return true
  }

  return false;
}



export function useLooseChanges(pair?: { entity: ModifiableEntity, lastEntity: string }) {

  let blocker = unstable_useBlocker(() => pair != null && JSON.stringify(pair.entity) != pair.lastEntity);

  React.useEffect(() => {
    if (blocker.state === "blocked") {
      let proceed = window.confirm(JavascriptMessage.loseCurrentChanges.niceToString());
      if (proceed) {
        setTimeout(blocker.proceed, 0);
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
}