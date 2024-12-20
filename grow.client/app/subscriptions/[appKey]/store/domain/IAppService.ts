import { App } from "./App";
import { Collection } from "./Collection";


export interface IAppService {
  getReferencedApp(appKey: string): App;

  getAppList(app: App): Collection;

  getCollection(app: App, collectionKey: string): Collection;

  getCollectionList(app: App): Collection;

  getPluginList(app: App): Collection;

  createCollection(createCollectionOptions: {
    name: string;
    displayName: string;
  }): void;

  copyCollection(
    source_app: string,
    source_collection: string,
    newCollection: { name: string; displayName: string }
  ): void;

  createCollectionSchemaField(collectionKey: string, field: any): void;

  createRecord(createRecordOptions: {
    collectionKey: string;
    contents: { [key: string]: any };
  }): void;

  copyRecord(copyRecordOptions: {
    source_app_key: string;
    source_collection_key: string;
    source_record_key: string;
    target_app_key: string;
    target_collection_key: string;
  }): void;

  updateRecord(updateRecordOptions: {
    collectionKey: string;
    recordKey: string;
    fieldKey: string;
    newValue: any;
  }): void;

  deleteRecords(deleteRecordOptions: {
    collectionKey: string;
    recordKeys: string[];
  }): void;

  subscribe(selector: string, callback: Function): void;

  unsubscribe(selector: string, callback: Function): void;

  unregisterMessageListeners(): void;
}
