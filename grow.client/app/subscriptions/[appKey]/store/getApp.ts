import { Collection, ICollection } from './getCollection';
import store from './store.json';

export async function getApp(appKey: string): Promise<IApp>{
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ key: appKey, ...store.apps[appKey]});
    }, 100);
  });
}

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

  key: string;
  _plugins: {
    [key: string]: Plugin;
  };
  plugins: {
    [key: string]: Plugin;
  };
  collections: {
    [key: string]: Collection;
  };

  constructor({key, plugins, collections}: IApp) {
    this.key = key;
    this._plugins = plugins;
    this.plugins = this._createPlugins(plugins);
    this.collections = this._createCollections(collections);
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
    for (const [key, value] of Object.entries(collections)) {
      collectionMap[key] = new Collection(value);
    }
    return collectionMap;
  }
}

export interface IPlugin {
  name: string;
  type: string;
  properties: {
    [key: string]: Property;
  };
}

export class Plugin {
  key: string;
  name: string;
  type: string;
  private _app: App;
  private _properties: {
    [key: string]: Property;
  };

  constructor(app: App, { key, name, type, properties }) {
    this._app = app;
    this.key = key;
    this.name = name;
    this.type = type;
    this._properties = properties;
  }

  get properties() {
    const propertiesMapped = {};

    Object.entries(this._properties).forEach(([_, property]) => {
      const collection = this._app.collections[property.collectionKey];

      propertiesMapped[property.name] = collection.records;
    });

    return propertiesMapped;
  }
}

export interface Property {
  name: string;
  collectionKey: string;
}