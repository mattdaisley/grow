import { Collection } from './getCollection';
import store from './store.json';

export async function getApp(appKey: string): Promise<App>{
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(store.apps[appKey]);
    }, 100);
  });
}


export interface App {
  plugins: {
    [key: string]: Plugin;
  };
  collections: {
    [key: string]: Collection;
  };
}

export interface Plugin {
  name: string;
  source: string;
  properties: object;
}