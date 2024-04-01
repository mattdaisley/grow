import { App } from './App';
import { Property } from './Property';


export interface IPlugin {
  name: string;
  parent: string;
  order: number;
  properties: {
    [key: string]: Property;
  };
}


export class Plugin {
  key: string;
  name: string;
  parent: string;
  order: number;
  private _app: App;
  private _properties: {
    [key: string]: Property;
  };

  constructor(app: App, { key, name, parent, order, properties }) {
    this._app = app;
    this.key = key;
    this.name = name;
    this.parent = parent;
    this.order = order;
    this._properties = properties;
  }

  get properties() {
    const propertiesMapped = {};

    Object.entries(this._properties).forEach(([_, property]) => {
      const collection = this._app.getCollection(property.collectionKey);

      propertiesMapped[property.name] = collection;
    });

    return propertiesMapped;
  }
}
