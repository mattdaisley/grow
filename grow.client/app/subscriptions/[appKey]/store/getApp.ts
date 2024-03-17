import { IApp } from './domain/App';
import store from './store.json';

export async function getApp(appKey: string): Promise<IApp>{
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ key: appKey, ...store.apps[appKey]});
    }, 250);
  });
}

