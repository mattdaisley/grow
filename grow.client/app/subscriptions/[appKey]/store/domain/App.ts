import { Collection, ICollection } from './Collection';
import { IPlugin, Plugin } from './Plugin';

import { v4 as uuidv4 } from 'uuid';
import { Record } from './Record';
import { AppService } from './AppService';

export interface IApp {
  key: string;
  plugins: {
    [key: string]: Plugin;
  };
  collections: {
    [key: string]: Collection;
  };
}


export class App {
  private _instance: string;
  key: string;
  _plugins: {
    [key: string]: Object;
  };
  plugins: {
    [key: string]: Plugin;
  };

  private _appState: { [key: string]: Record } = {};

  private _referencedApps: {
    [key: string]: App;
  };
  private _collections: {
    [key: string]: Collection;
  };
  private _app_display_list: Collection;
  private _plugins_display_list: Collection;
  private _collections_display_list: Collection;

  private _appService: AppService;

  constructor({ key, plugins, collections }: IApp, appService: AppService) {
    this._instance = uuidv4();

    this._appService = appService;
    this._appService.subscribe("*", this.handleEvent.bind(this));

    // console.log('App constructor app key:', key, plugins);
    this.key = key;
    this._plugins = plugins;
    this.plugins = this._createPlugins(plugins);
    this._collections = this._createCollections(collections);
    this._referencedApps = {};
  }

  public unregisterMessageListeners() {
    // console.log('unregistering socket listener', `subscriptions-${this.key}`)
    this._appService.unregisterMessageListeners();
  }

  public getAppInstance() {
    return this._instance;
  }

  private _createPlugins(plugins: { [key: string]: IPlugin }) {
    const pluginMap = {};
    for (const [key, value] of Object.entries(plugins)) {
      pluginMap[key] = new Plugin(this, { key, ...value });
    }
    return pluginMap;
  }

  private _createCollections(collections: { [key: string]: ICollection }) {
    const collectionMap = {};
    for (const [collectionKey, collection] of Object.entries(collections)) {
      collectionMap[collectionKey] = new Collection(this, {
        key: collectionKey,
        ...collection,
      });
    }
    return collectionMap;
  }

  public getAppDisplayList(): Collection {
    if (!this._app_display_list) {
      // console.log(`App ${this.key}: ${this._instance} getAppDisplayList not found`)
      this._appService.getAppList();

      this._app_display_list = new Collection(this, {
        key: `${this.key}.al`,
        schema: undefined,
        records: undefined,
        type: "app_list",
      });
    }

    return this._app_display_list;
  }

  public getReferencedApp(appKey: string): App {
    if (appKey === this.key) {
      return this;
    }

    if (!this._referencedApps[appKey]) {
      this._referencedApps[appKey] = new App(
        { key: appKey, plugins: {}, collections: {} },
        new AppService(appKey, this._appService.getSocket())
      );
    }

    return this._referencedApps[appKey];
  }

  public getReferencedAppCollection(
    appKey: string,
    collectionKey: string
  ): Collection {
    const app = this.getReferencedApp(appKey);

    return app.getCollection(collectionKey);
  }

  public getCollection(collectionKey: string): Collection {
    if (!this._collections[collectionKey]) {
      // console.log(`App ${this.key}: ${this._instance} getCollection key not found`, collectionKey)
      this._appService.getCollection(collectionKey);

      this._collections[collectionKey] = new Collection(this, {
        key: collectionKey,
        schema: undefined,
        records: undefined,
      });
    }

    return this._collections[collectionKey];
  }

  public getCollectionDisplayList(): Collection {
    if (!this._collections_display_list) {
      // console.log(`App ${this.key}: ${this._instance} getCollectionDisplayList not found`)
      this._appService.getCollectionList();

      this._collections_display_list = new Collection(this, {
        key: `${this.key}.cl`,
        schema: undefined,
        records: undefined,
        type: "collection_list",
      });
    }

    return this._collections_display_list;
  }

  public getPluginDisplayList(): Collection {
    if (!this._plugins_display_list) {
      // console.log(`App ${this.key}: ${this._instance} getPluginDisplayList not found`)
      this._appService.getPluginList();

      this._plugins_display_list = new Collection(this, {
        key: `${this.key}.pl`,
        schema: undefined,
        records: undefined,
        type: "plugin_list",
      });
    }

    // console.log(`App ${this.key}: ${this._instance}`, this._plugins_display_list)
    return this._plugins_display_list;
  }

  public pushCreateCollectionSchemaField(
    collectionKey: string,
    field: { name: string; type: string }
  ) {
    this._appService.createCollectionSchemaField(collectionKey, field);
  }

  public pushCreateCollection(collectionOptions: {
    name: string;
    displayName: string;
  }) {
    this._appService.createCollection(collectionOptions);
  }

  public pushCopyCollection(
    source_app: string,
    source_collection: string,
    newCollection: { name: string; displayName: string }
  ) {
    this._appService.copyCollection(
      source_app,
      source_collection,
      newCollection,
    );
  }

  public pushCreateRecord(
    collectionKey: string,
    contents: { [key: string]: any }
  ) {
    this._appService.createRecord({ collectionKey, contents });
  }

  public pushUpdateRecord(
    collectionKey: string,
    recordKey: string,
    fieldKey: string,
    newValue: any
  ) {
    this._appService.updateRecord({
      collectionKey,
      recordKey,
      fieldKey,
      newValue,
    });
  }

  public pushDeleteRecords(collectionKey: string, recordKeys: string[]) {
    this._appService.deleteRecords({
      collectionKey,
      recordKeys,
    });
  }

  handleEvent(key: string, value: any, isSelfUpdate: boolean = false) {
    // console.log('App handleEvent', data, JSON.stringify(Object.keys(this._collections)));
    const collection = this._collections[value.collectionKey];
    // console.log('App handleEvent', key, value, collection)

    switch (key) {
      case "l":
        collection?.setCollection(value);
        break;
      case "i":
        Object.entries(value.records).forEach(([recordKey, record]) => {
          collection?.addRecord(recordKey, record);
        });
        break;
      case "d":
        Object.entries(value.records).forEach(([recordKey, record]) => {
          collection?.removeRecord(recordKey);
        });
        break;
      case "u":
        Object.entries(value.records).forEach(([recordKey, record]) => {
          collection?.updateRecord(recordKey, record, isSelfUpdate);
        });
        break;
      case "al":
        if (this._app_display_list) {
          this._app_display_list.setCollection({
            schema: value.schema,
            records: value.records,
          });
        }
        break;
      case "cl":
        if (this._collections_display_list) {
          this._collections_display_list.setCollection({
            schema: value.schema,
            records: value.records,
          });
        }
        break;
      case "pl":
        if (this._plugins_display_list) {
          this._plugins_display_list.setCollection({
            schema: value.schema,
            records: value.records,
          });
        }
        break;
      default:
      // console.log('Unknown event type', key, value);
    }
  }

  public getFromAppState(key: string): Record {
    if (!this._appState.hasOwnProperty(key)) {
      let params = new URL(document.location.toString()).searchParams;
      let searchParamValue: string = params.get(key);
      let initialValue: any = searchParamValue;

      if (searchParamValue?.toLowerCase() === "false") {
        initialValue = false;
      }
      if (searchParamValue?.toLowerCase() === "true") {
        initialValue = true;
      }
      // console.log("getFromAppState", key, searchParamValue, initialValue);

      this._appState[key] = new Record(this, undefined, {
        schema: {
          name: "",
          display_name: "",
          fields: {
            [key]: {
              type: "appStateKey",
              name: key,
            },
          },
        },
        key,
        record: { [key]: initialValue },
      });
    }

    return this._appState[key];
  }
}
