import { App } from './App';
import { Property } from './Property';


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

      propertiesMapped[property.name] = collection;
    });

    return propertiesMapped;
  }
}
