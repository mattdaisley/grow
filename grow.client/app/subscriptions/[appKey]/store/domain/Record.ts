import { App } from './App';
import { Collection } from './Collection';
import { ISchema } from './Schema';


const BRACKET_PATTERN = new RegExp("({{ *([a-zA-Z0-9-_.]*) *}})", "g");

export class Record {
  key: string;
  schema: ISchema;
  _record: object;

  private _app: App;
  private _collection: Collection;
  private _subscriptions: {
    [selector: string]: Function[];
  };

  constructor(
    app: App,
    collection: Collection,
    { schema, key, record }: { schema: ISchema; key: string; record: object }
  ) {
    this._app = app;
    this._collection = collection;
    this.key = key;
    this.schema = schema;
    this._record = record;
    this._subscriptions = {};
  }

  _callbacks: { [key: string]: Function } = {};
  _referencedFields: {};

  get rawValue(): Object {
    const fields = {};

    Object.entries(this.schema.fields).forEach(([fieldKey, field]) => {
      const fieldValue = this._record[fieldKey];
      // console.log('record field', this, fieldKey, field, this._record[fieldKey], this.schema.fields)

      if (fieldValue === undefined) {
        if (field.type === "string") {
          fields[field.name] = "";
          return;
        }

        if (field.type === "number") {
          fields[field.name] = 0;
          return;
        }

        if (field.type === "boolean") {
          fields[field.name] = false;
          return;
        }

        if (
          field.type === "app_list" ||
          field.type === "app_collection_list" ||
          field.type === "collection_field_list" ||
          field.type === "collection_record_list"
        ) {
          // value doesn't currently matter. Just returns an empty string so the actual 'value' can return all apps.
          // could be used to filter apps in the future.

          fields[field.name] = "";
          return;
        }

        fields[field.name] = undefined;
        // return;
      }

      if (fieldKey === "createdDate" || fieldKey === "updatedDate") {
        fields[fieldKey] = new Date(this._record[fieldKey]).toLocaleString();
        return;
      }

      // if (field.type === 'app_list') {
      //   // value doesn't currently matter. Just returns all apps.
      //   // could be used to filter apps in the future.

      //   fields[field.name] = this._app.getAppDisplayList();
      //   console.log('Record.app_list', fieldValue, fields[field.name])
      //   return;
      // }

      if (field.type === "app") {
        if (fieldValue === undefined) {
          fields[field.name] = "";
          // console.log('Record.app', field.name, fields[field.name])
          return;
        }
      }

      if (field.type === "app_plugin_list") {
        const selectedPluginValue = fieldValue ? fieldValue : "None";

        fields[field.name] = {
          key: selectedPluginValue,
          type: "plugin",
          _app: this._app,
          value: { display_name: selectedPluginValue },
        };
        // fields[field.name] = this._app.getPluginDisplayList();
        // console.log('Record.app_plugin_list', field.name, fieldValue, fields[field.name])
        return;
      }

      if (field.type === "app_plugins") {
        // fields[field.name] = { key: fieldValue, type: 'plugin', _app: this._app, value: { display_name: fieldValue } };
        fields[field.name] = this._app.getPluginDisplayList();
        // console.log('Record.app_plugin', field.name, fieldValue, fields[field.name])
        return;
      }

      if (field.type === "app_collection") {
        if (fieldValue === undefined) {
          fields[field.name] = "";
          // console.log('Record.app_collection', field.name, fields[field.name])
          return;
        }
      }

      if (field.type === "collection") {
        // console.log('Record.collection', field.name, fieldValue)
        fields[field.name] = this._app.getCollection(fieldValue);
        // console.log('Record.collection', field.name, fieldValue, fields[field.name])
        return;
      }

      if (field.type === "record_key") {
        const recordKeyValue = fieldValue ? fieldValue : "";
        // console.log('Record.record_key', field.name, fieldValue)
        fields[field.name] = recordKeyValue;
        // console.log('Record.record_key', field.name, fieldValue, fields[field.name])
        return;
      }

      fields[field.name] = fieldValue;
    });

    return fields;
  }

  get bracketValues(): { [key: string]: Object } {
    const bracketValues = {};

    Object.entries(this.schema.fields).forEach(([fieldKey, field]) => {
      bracketValues[field.name] = this._getBracketFieldValue(
        field,
        this._record[fieldKey]
      );
    });

    return bracketValues;
  }

  bracketValueByFieldName(fieldName: string) {
    const bracketValues = {};

    const matchingFields = Object.entries(this.schema.fields).filter(
      ([fieldKey, field]) => field.name === fieldName
    );

    matchingFields.forEach(([fieldKey, field]) => {
      bracketValues[field.name] = this._getBracketFieldValue(
        field,
        this._record[fieldKey]
      );
    });

    return bracketValues[fieldName];
  }

  private _getBracketFieldValue(field, fieldValue: string) {
    // console.log("Record._getBracketFieldValue", field, fieldValue, typeof fieldValue)
    let returnBracketValue = {};

    if (typeof fieldValue !== "string") {
      // obviously no bracket values to replace
      // console.log("Record._getBracketFieldValue fieldValue not a string", fieldValue, fieldValue === undefined)
      return returnBracketValue;
    }

    if (!fieldValue.match(BRACKET_PATTERN)) {
      // console.log("Record._getBracketFieldValue fieldValue has no matches for the bracket pattern", fieldValue, BRACKET_PATTERN)
      return returnBracketValue;
    }

    var match;
    var bracketSelectors = [];
    while ((match = BRACKET_PATTERN.exec(fieldValue)) !== null) {
      // console.log('Record._getBracketFieldValue match', match)
      bracketSelectors.push(match[1]); // push the nested group to the selectors array
    }
    // console.log("Record._getBracketFieldValue bracketSelectors", bracketSelectors); // logs an array of all matched selectors
    if (bracketSelectors.length > 0) {
      
      bracketSelectors.forEach((bracketSelector) => {
        // console.log("Record._getBracketFieldValue returnBracketValue has bracketSelector", returnBracketValue, bracketSelector); // logs an array of all matched selectors
        if (returnBracketValue.hasOwnProperty(bracketSelector)) {
          return;
        }

        const bracketValue = this._getBracketValue(
          bracketSelector,
          fieldValue,
          field
        );

        returnBracketValue[bracketSelector] = bracketValue;
      });
    }

    return returnBracketValue;
  }

  get value(): Object {
    const fields = {};
    const bracketValues = this.bracketValues;
    // console.log("Record.value", this);

    Object.entries(this.schema.fields).forEach(([fieldKey, field]) => {
      let fieldValue = this._getFieldValue(
        this.rawValue[field.name],
        field,
        bracketValues[field.name]
      );

      fields[field.name] = fieldValue;
    });

    return fields;
  }

  valueByFieldName(fieldName: string): any {
    const fields = {};
    const bracketValue = this.bracketValueByFieldName(fieldName);
    // console.log("Record.valueByFieldName", fieldName, this, bracketValue);

    const matchingFields = Object.values(this.schema.fields).filter(
      (field) => field.name === fieldName
    );

    matchingFields.forEach((field) => {
      let fieldValue = this._getFieldValue(
        this.rawValue[field.name],
        field,
        bracketValue
      );

      fields[field.name] = fieldValue;
    });

    return fields[fieldName];
  }

  private _getFieldValue(rawValue, field, fieldBracketValue: Object): any {
    let resultFieldValue = rawValue;

    if (rawValue === undefined) {
      // let the rawValue be returned
      return resultFieldValue;
    }

    let patternValue: string = rawValue;
    // console.log("Record._getFieldValue", rawValue, fieldBracketValue, field.type);
    if (Object.keys(fieldBracketValue).length > 0) {
      Object.entries(fieldBracketValue).forEach(([selector, bracketValue]) => {
        // console.log('Record._getFieldValue replacing selector', selector, bracketValue, patternValue);
        try {
          patternValue = patternValue.replace(selector, bracketValue);
        } catch (e) {
          console.log(
            "Record._getFieldValue bracketValues",
            selector,
            bracketValue,
            patternValue,
            e
          );
        }
      });

      resultFieldValue = patternValue;

      if (BRACKET_PATTERN.exec(patternValue) !== null) {
        // not able to replace all selectors
        // console.log('Record._getFieldValue not able to replace all selectors', patternValue);
        // this is now valid because of nested selectors that are not yet replaced
        // return resultFieldValue;
      }
    }

    if (patternValue !== undefined && typeof patternValue === "string") {
      // console.log('Record.value after possible selectors', patternValue, field.type);
      if (field.type === "app") {
        // e.g. "app.2" or "app.{{a.1.c.25.r.44.f_1_0_3}}"
        const appKeySplit = patternValue.split(".");
        if (appKeySplit.length > 1 && appKeySplit[0] === "app") {
          const appKey = appKeySplit[1];
          // console.log('Record.value app', appKey)

          let nestedApp: App;
          if (appKey === this._app.key) {
            nestedApp = this._app;
          } else {
            nestedApp = this._app.getReferencedApp(appKey);
          }

          return nestedApp;
        }
      }

      if (field.type === "app_list") {
        // value doesn't currently matter. Just returns all apps.
        // could be used to filter apps in the future.

        resultFieldValue = this._app.getAppDisplayList();

        // console.log("Record.app_list", field, resultFieldValue);
        return resultFieldValue;
      }

      if (field.type === "app_collection_list") {
        // console.log('Record.value app_collection_list', patternValue);
        const valueSplit = patternValue.split(".");
        if (valueSplit.length > 1 && valueSplit[0] === "app") {
          const appKey = valueSplit[1];
          // console.log('Record.value app_collection_list', valueSplit)
          // console.log(valueSplit);

          let nestedApp: App;
          if (appKey === this._app.key) {
            nestedApp = this._app;
          } else {
            nestedApp = this._app.getReferencedApp(appKey);
          }

          // console.log('Record.value app_collection_list', appKey, field.name)
          return nestedApp.getCollectionDisplayList();
        }
      }

      if (field.type === "collection_field_list") {
        // console.log('Record.value collection_field_list', patternValue);
        const valueSplit = patternValue.split(".");
        if (valueSplit.length > 3 && valueSplit[0] === "app") {
          const appKey = valueSplit[1];
          // console.log('Record.value app_collection_list', valueSplit)
          // console.log(valueSplit);

          let nestedApp: App;
          if (appKey === this._app.key) {
            nestedApp = this._app;
          } else {
            nestedApp = this._app.getReferencedApp(appKey);
          }

          const collectionKey = valueSplit[3];
          const collection = nestedApp.getCollection(collectionKey);

          // console.log('Record.value app_collection_list', appKey, field.name)
          return collection.getFieldsDisplayList();
        }
      }

      if (field.type === "collection_record_list") {
        // console.log(
        //   "Record.value collection_record_list",
        //   patternValue,
        //   patternValue.split(".")
        // );
        const valueSplit = patternValue.split(".");
        if (valueSplit.length > 3 && valueSplit[0] === "app") {
          const appKey = valueSplit[1];
          // console.log('Record.value app_collection_list', valueSplit)
          // console.log(valueSplit);

          let nestedApp: App;
          if (appKey === this._app.key) {
            nestedApp = this._app;
          } else {
            nestedApp = this._app.getReferencedApp(appKey);
          }

          const collectionKey = valueSplit[3];
          const collection = nestedApp.getCollection(collectionKey);

          // console.log('Record.value app_collection_list', appKey, field.name)
          return collection.getRecordsDisplayList();
        }
      }

      if (field.type === "app_collection") {
        // e.g. "app.2.collections.4" or "app.{{a.1.c.25.r.44.f_1_0_3}}.collections.{{appState.selectedRecord}}"
        const collectionKeySplit = patternValue.split(".");
        if (
          collectionKeySplit &&
          collectionKeySplit.length > 1 &&
          collectionKeySplit[0] === "app" &&
          collectionKeySplit[2] === "collections"
        ) {
          // console.log('Record.value app_collection_list', collectionKeySplit)
          const appKey = collectionKeySplit[1];
          const collectionKey = collectionKeySplit[3];

          let nestedCollection: Collection;
          if (appKey === this._app.key) {
            nestedCollection = this._app.getCollection(collectionKey);
          } else {
            nestedCollection = this._app.getReferencedAppCollection(
              appKey,
              collectionKey
            );
          }

          return nestedCollection;
        } else {
          // console.log('Record.value app_collection', field.name, fieldValue)
          resultFieldValue = rawValue;
        }
      }
    }

    // console.log('field.type', field.type, resultFieldValue)
    if (field.type === "number") {
      const numberValue = parseFloat(resultFieldValue);

      if (!isNaN(numberValue)) {
        return numberValue;
      }
      console.log("Record.value not a number", resultFieldValue);
      resultFieldValue = 0;
    }

    return resultFieldValue;
    // console.log('Record value patternValue', `"${fieldValue}"`, `"${patternValue}"`)
  }

  getDisplayValueByFieldName(fieldName: string): string {
    const value = this.valueByFieldName(fieldName);
    const fieldType = this.fieldTypeByFieldName(fieldName);

    // console.log('Record.getDisplayValueByFieldName', fieldName, value, fieldType)
    let displayValue = value?.toString();

    if (fieldType === "collection") {
      displayValue = `${value?.key} - ${value?.schema?.display_name}`;
    }

    if (fieldType === "app_plugin_list") {
      displayValue = `${value?.value?.display_name}`;
    }

    return displayValue;
  }

  fieldTypeByFieldName(fieldName: string): string {
    const matchingFields = Object.values(this.schema.fields).filter(
      (field) => field.name === fieldName
    );

    if (matchingFields.length > 0) {
      return matchingFields[0].type;
    }
  }

  get appDisplayName(): string {
    return this._app.key;
  }

  get collectionDisplayName(): string {
    return this._collection.schema.display_name;
  }

  private _getBracketValue(bracketSelector: any, fieldValue: any, field: any) {
    const appRecordRegex =
      /a\.([a-zA-Z0-9-_]+)\.c.([a-zA-Z0-9-_]+)\.r\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)/;
    const appRecordMatches = bracketSelector.match(appRecordRegex);
    // console.log("Record._getBracketValue appRecordMatches", bracketSelector, appRecordMatches)
    if (appRecordMatches) {
      const appRecordValue = this._getAppRecordValue(
        appRecordMatches,
        fieldValue,
        field
      );
      // console.log('Record.value appRecordValue',  appRecordValue, selector)
      return appRecordValue !== undefined ? appRecordValue : bracketSelector;
    }

    const appStateRegex = /appState\.([a-zA-Z0-9-_]+)/;
    const appStateMatches = bracketSelector.match(appStateRegex);
    // console.log('Record._getBracketValue appStateMatches', appStateMatches)
    if (appStateMatches) {
      const appStateValue = this._getAppStateValue(appStateMatches, field);
      // console.log(
      //   "Record.value appStateValue",
      //   appStateValue,
      //   bracketSelector,
      //   field,
      //   this._app.getAppInstance()
      // );

      return appStateValue !== undefined ? appStateValue : bracketSelector;
    }

    return bracketSelector;
  }

  private _getAppRecordValue(matches: any, fieldValue: any, field: any) {
    const appKey = matches[1];
    const collectionKey = matches[2];
    const recordKey = matches[3];
    const nestedFieldKey = matches[4];
    // console.log(
    //   "Record._getAppRecordValue, value match group properties",
    //   field,
    //   matches,
    //   appKey,
    //   collectionKey,
    //   recordKey,
    //   nestedFieldKey
    // );
    let nestedCollection: Collection;
    if (appKey === this._app.key) {
      nestedCollection = this._app.getCollection(collectionKey);
    } else {
      nestedCollection = this._app.getReferencedAppCollection(
        appKey,
        collectionKey
      );
    }

    const nestedCollectionCallbacksKey = `${appKey}.${collectionKey}`;
    if (!this._callbacks.hasOwnProperty(nestedCollectionCallbacksKey)) {
      const callback = (_: Record) => {
        // console.log("Record._getAppRecordValue nested collection callback");
        this._notifySubscribers(field.name);
      };

      this._callbacks[nestedCollectionCallbacksKey] = callback;
      nestedCollection.subscribe("*", callback);
    }

    // console.log(
    //   "Record._getAppRecordValue value nestedCollection",
    //   nestedCollection?.records,
    //   nestedCollection?.records?.hasOwnProperty(recordKey)
    // );
    if (nestedCollection) {
      if (nestedCollection.records?.hasOwnProperty(recordKey)) {
        const nestedRecord = nestedCollection.records[recordKey];
        const nestedField = nestedRecord.schema.fields[nestedFieldKey];
        // console.log("Record._getAppRecordValue nestedRecord", nestedRecord, nestedFieldKey, nestedField)
        if (nestedField) {
          const callbacksKey = `${field.name}-${appKey}.${collectionKey}.${recordKey}.${nestedFieldKey}`;

          if (!this._callbacks.hasOwnProperty(callbacksKey)) {
            // console.log("Record._getAppRecordValue adding callback", callbacksKey);
            const callback = (_: Record) => {
              // console.log(
              //   "Record._getAppRecordValue nested record callback",
              //   callbacksKey,
              //   field.name
              // );
              this._notifySubscribers(field.name);
            };

            // console.log(
            //   "nested record subscribing callback",
            //   callbacksKey,
            //   field.name,
            //   nestedField.nam
            // );
            this._callbacks[callbacksKey] = callback;
            nestedRecord.subscribe(nestedField.name, callback);
          }

          return nestedRecord.valueByFieldName(nestedField.name);
        }
      }
    }
  }

  private _getAppStateValue(matches: any, field: any): string {
    const appStateKey = matches[1];
    const appStateRecord: Record = this._app.getFromAppState(appStateKey);

    if (!this._callbacks.hasOwnProperty(appStateKey)) {
      const callback = (newRecord: Record) => {
        // console.log('_getAppStateValue callback', appStateKey, newRecord)
        this._notifySubscribers(field.name);
        // setValue((currentValue) => ({...currentValue, [key]: { ...currentValue[key], value: newRecord.value[field]}}));
        // setValue({...value, [field]: newRecord.value[field]});
      };

      this._callbacks[appStateKey] = callback;
      appStateRecord.subscribe(appStateKey, callback);
    }

    return appStateRecord?.value?.[appStateKey];
  }

  update(record: any, isSelfUpdate = false) {
    const difference = Object.keys(record).filter(
      (k) => this._record[k] !== record[k]
    );

    if (!isSelfUpdate) {
      this._record = {
        ...this._record,
        ...record,
      };
    }
    else {
      this._record = {
        ...this._record,
        updatedDate: record.updatedDate,
        version: record.version,
      }
    }

    difference.forEach((k) =>
      this._notifySubscribers(this.schema.fields[k].name)
    );
  }

  updateField(fieldName: string, newValue: any) {
    // console.log('updateField', fieldName, newValue, this._record)
    const newRecord = { ...this._record };

    Object.entries(this.schema.fields).forEach(([fieldKey, field]) => {
      const fieldValue = this._record[fieldKey];

      if (field.name === fieldName && fieldValue !== newValue) {
        newRecord[fieldKey] = newValue;
        // this._record[fieldKey] = newValue;
        // this._notifySubscribers(fieldName)

        if (this._collection?.key) {
          this._app.pushUpdateRecord(
            this._collection.key,
            this.key,
            fieldKey,
            newValue
          );
        }
      }
    });

    this.update(newRecord);
  }

  updateSchema(schema: ISchema) {
    this.schema = schema;
  }

  subscribe(selector: string, callback: Function) {
    // console.log('record subscribe', selector, this.key)
    if (!this._subscriptions[selector]) {
      this._subscriptions[selector] = [];
    }
    this._subscriptions[selector].push(callback);
  }

  unsubscribe(selector: string, callback: Function) {
    if (this._subscriptions[selector]) {
      this._subscriptions[selector] = this._subscriptions[selector].filter(
        (cb) => cb !== callback
      );
    }
  }

  private _notifySubscribers(type: string) {
    // console.log("Record _notifySubscribers", type, this._subscriptions)
    Object.entries(this._subscriptions).forEach(([selector, callbacks]) => {
      if (type === "*" || selector === type) {
        // console.log("Record _notifySubscribers", selector, type, callbacks.length)
        callbacks.forEach((cb) => cb(this));
      }
    });
  }
}
