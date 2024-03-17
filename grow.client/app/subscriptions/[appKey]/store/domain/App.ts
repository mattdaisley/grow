import { Collection, ICollection } from './Collection';
import { IPlugin, Plugin } from './Plugin';


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
    [key: string]: Object;
  };
  plugins: {
    [key: string]: Plugin;
  };
  collections: {
    [key: string]: Collection;
  };

  constructor({ key, plugins, collections }: IApp) {
    console.log('App constructor app key:', key);
    this.key = key;
    this._plugins = plugins;
    this.plugins = this._createPlugins(plugins);
    this.collections = this._createCollections(collections);
  }

  private _createPlugins(plugins: { [key: string]: IPlugin; }) {
    const pluginMap = {};
    for (const [key, value] of Object.entries(plugins)) {
      pluginMap[key] = new Plugin(this, { key, ...value });
    }
    return pluginMap;
  }

  private _createCollections(collections: { [key: string]: ICollection; }) {
    const collectionMap = {};
    for (const [collectionKey, collection] of Object.entries(collections)) {
      collectionMap[collectionKey] = new Collection({key: collectionKey, ...collection});
    }
    return collectionMap;
  }
}
