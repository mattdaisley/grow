import { App } from './App';
import { Collection } from './Collection';
import { ISchema } from './ISchema';


const BRACKET_PATTERN = new RegExp("({{ *([a-zA-Z0-9-_.]*) *}})", "g");

export class Record<TValue extends Object = any> {
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
    this.setSchema(schema);
    this._record = record;
    this._subscriptions = {};
  }

  _callbacks: { [key: string]: Function } = {};
  _referencedFields: {};

  public setSchema(schema: ISchema) {
    this.schema = schema;
  }

  public update(record: any, isSelfUpdate = false) {
    const difference = Object.keys(record).filter(
      (k) => this._record[k] !== record[k]
    );

    if (!isSelfUpdate) {
      this._record = {
        ...this._record,
        ...record,
      };
    } else {
      this._record = {
        ...this._record,
        updatedDate: record.updatedDate,
        version: record.version,
      };
    }

    difference.forEach((k) =>
      this._notifySubscribers(this.schema.fields[k].name)
    );
  }

  public updateField(fieldName: string, newValue: any) {
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
          field.type === "app" ||
          field.type === "app_collection" ||
          field.type === "app_collection_list" ||
          field.type === "app_list" ||
          field.type === "collection_field_key" ||
          field.type === "collection_field_list" ||
          field.type === "collection_record_list" ||
          field.type === "record_key" ||
          field.type === "referenced_field"
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

      if (field.type === "collection") {
        // console.log('Record.collection', field.name, fieldValue)
        fields[field.name] = this._app.getCollection(fieldValue);
        // console.log('Record.collection', field.name, fieldValue, fields[field.name])
        return;
      }

      fields[field.name] = fieldValue;
    });

    return fields;
  }

  get value(): TValue {
    const fields = {} as TValue;
    const bracketValues = this._getBracketValues();
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

  public valueByFieldName(fieldName: string): any {
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

      if (field.type === "collection_field_key") {
        fields[field.name] = fieldValue.value;
      } else {
        fields[field.name] = fieldValue;
      }
    });

    return fields[fieldName];
  }

  public displayValueByFieldName(fieldName: string): string {
    const value = this.valueByFieldName(fieldName);
    const fieldType = this._fieldTypeByFieldName(fieldName);

    // console.log('Record.getDisplayValueByFieldName', fieldName, value, fieldType)
    let displayValue = value?.toString();

    if (fieldType === "collection") {
      displayValue = `${value?.key} - ${value?.schema?.display_name}`;
    }

    if (fieldType === "collection_field_key") {
      // console.log("Record.getDisplayValueByFieldName collection_field_key", fieldName, value);
      displayValue = value.displayValue;
    }

    if (fieldType === "app_plugin_list") {
      displayValue = `${value?.value?.display_name}`;
    }

    return displayValue;
  }

  public bracketValueByFieldName(fieldName: string) {
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

  private _getBracketValues(): { [key: string]: Object } {
    const bracketValues = {};

    Object.entries(this.schema.fields).forEach(([fieldKey, field]) => {
      bracketValues[field.name] = this._getBracketFieldValue(
        field,
        this._record[fieldKey]
      );
    });

    return bracketValues;
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

  private _getFieldValue(rawValue, field, fieldBracketValue: Object): any {
    let resultFieldValue = rawValue;

    if (rawValue === undefined) {
      // let the rawValue be returned
      return resultFieldValue;
    }

    let patternValue = rawValue;

    if (field.type === "collection_field_key") {
      patternValue = {
        value: rawValue,
        displayValue: rawValue,
      };
    }

    // console.log("Record._getFieldValue", rawValue, fieldBracketValue, field.type);
    if (Object.keys(fieldBracketValue).length > 0) {
      Object.entries(fieldBracketValue).forEach(([selector, bracketValue]) => {
        // console.log('Record._getFieldValue replacing selector', selector, bracketValue, patternValue);

        if (field.type === "collection_field_key") {
          // console.log("Record.value collection_field_key", patternValue);
          patternValue = {
            value: patternValue.value.replace(selector, bracketValue.fieldKey),
            displayValue: patternValue.displayValue.replace(
              selector,
              bracketValue.fieldValue
            ),
          };
          // } else if (field.type === "referenced_field") {
          //   patternValue = {
          //     value: patternValue.value.replace(selector, bracketValue.fieldKey),
          //     displayValue: patternValue.displayValue.replace(
          //       selector,
          //       bracketValue.fieldValue
          //     ),
          //   };
        } else {
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

    // console.log("Record._getFieldValue", patternValue, field.type, field.name, fieldBracketValue)

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
            const referencedApp = this._app.getReferencedApp(appKey);
            nestedCollection = referencedApp.getCollection(collectionKey);
          }

          return nestedCollection;
        } else {
          // console.log('Record.value app_collection', field.name, fieldValue)
          resultFieldValue = rawValue;
        }
      }

      if (field.type === "referenced_field") {
        // const regex =
        //   /collections\.([a-zA-Z0-9-_]+)\.records\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)/;
        // const matches = patternValue.match(regex);
        // // console.log("RecordPlugin useRecordsResult", key, value, matches);
        // if (matches) {

        //   const collectionKey = matches[1];
        //   const recordKey = matches[2];
        //   const fieldKey = matches[3];

        //   const collection = this._app.getCollection(collectionKey);
        //   // const collection = app.collections[collectionKey];

        //   return {
        //     collection,
        //     recordKey,
        //     fieldKey,
        //     // fieldPropKey: key,
        //   };
        // }

        const appRecordRegex =
          /a\.([a-zA-Z0-9-_]+)\.c.([a-zA-Z0-9-_]+)\.r\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)/;
        const appRecordMatches = patternValue.match(appRecordRegex);
        if (appRecordMatches) {
          const appRecord = this._getAppRecord(appRecordMatches, field);

          if (appRecord !== undefined) {
            const { nestedRecord, nestedFieldKey } = appRecord;

            return {
              collection: nestedRecord._collection,
              recordKey: nestedRecord.key,
              fieldKey: nestedFieldKey,
              // fieldPropKey: key,
            };
          }
          // console.log('Record.value appRecordValue',  appRecordValue, selector)
          // return appRecordValue !== undefined ? appRecordValue : patternValue;
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

  private _fieldTypeByFieldName(fieldName: string): string {
    const matchingFields = Object.values(this.schema.fields).filter(
      (field) => field.name === fieldName
    );

    if (matchingFields.length > 0) {
      return matchingFields[0].type;
    }
  }

  private _getBracketValue(bracketSelector: any, fieldValue: any, field: any) {
    const appRecordRegex =
      /a\.([a-zA-Z0-9-_]+)\.c.([a-zA-Z0-9-_]+)\.r\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)/;
    const appRecordMatches = bracketSelector.match(appRecordRegex);
    // console.log("Record._getBracketValue appRecordMatches", bracketSelector, appRecordMatches)
    if (appRecordMatches) {
      const appRecordValue = this._getAppRecordValue(appRecordMatches, field);
      // console.log('Record.value appRecordValue',  appRecordValue, selector)
      return appRecordValue !== undefined ? appRecordValue : bracketSelector;
    }

    const collectionFieldRegex =
      /a\.([a-zA-Z0-9-_]+)\.c.([a-zA-Z0-9-_]+)\.f\.([a-zA-Z0-9-_]+)/;
    const collectionFieldMatches = bracketSelector.match(collectionFieldRegex);
    // console.log("Record._getBracketValue collectionFieldMatches", collectionFieldMatches)
    if (collectionFieldMatches) {
      const collectionFieldValue = this._getCollectionFieldValue(
        collectionFieldMatches,
        fieldValue,
        field
      );
      // console.log('Record.value collectionFieldValue',  collectionFieldValue, selector)
      return collectionFieldValue !== undefined
        ? collectionFieldValue
        : bracketSelector;
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
  private _getAppRecordValue(matches: any, field: any) {
    const appRecord = this._getAppRecord(matches, field);

    // console.log("Record._getAppRecordValue nestedRecord", nestedRecord, nestedFieldKey, nestedField)
    if (appRecord !== undefined) {
      const { nestedRecord, nestedField } = appRecord;
      return nestedRecord.valueByFieldName(nestedField.name);
    }
  }

  private _getAppRecord(matches: any, field: any) {
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
      const referencedApp = this._app.getReferencedApp(appKey);
      nestedCollection = referencedApp.getCollection(collectionKey);
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
        }

        return {
          nestedRecord,
          nestedFieldKey,
          nestedField,
        };
      }
    }
  }

  private _getCollectionFieldValue(matches: any, fieldValue: any, field: any) {
    const appKey = matches[1];
    const collectionKey = matches[2];
    const fieldKey = matches[3];
    // console.log(
    //   "Record._getCollectionFieldValue, value match group properties",
    //   field,
    //   matches,
    //   appKey,
    //   collectionKey,
    //   fieldKey
    // );
    let nestedCollection: Collection;
    if (appKey === this._app.key) {
      nestedCollection = this._app.getCollection(collectionKey);
    } else {
      const referencedApp = this._app.getReferencedApp(appKey);
      nestedCollection = referencedApp.getCollection(collectionKey);
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
    //   "Record._getCollectionFieldValue value nestedCollection",
    //   nestedCollection
    // );
    if (nestedCollection) {
      if (nestedCollection.schema?.fields?.hasOwnProperty(fieldKey)) {
        const nestedField = nestedCollection.schema.fields[fieldKey];
        // console.log("Record._getAppRecordValue nestedRecord", nestedRecord, nestedFieldKey, nestedField)
        if (nestedField) {
          const callbacksKey = `${field.name}-${appKey}.${collectionKey}.f.${fieldKey}`;

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
            nestedCollection.subscribe(nestedField.name, callback);
          }

          return { fieldKey, fieldValue: nestedField.name };
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

    // return { fieldKey: appStateKey, fieldValue: appStateRecord?.value?.[appStateKey] };
    return appStateRecord?.valueByFieldName(appStateKey);
  }

  public subscribe(selector: string, callback: Function) {
    // console.log('record subscribe', selector, this.key)
    if (!this._subscriptions[selector]) {
      this._subscriptions[selector] = [];
    }
    this._subscriptions[selector].push(callback);
  }

  public unsubscribe(selector: string, callback: Function) {
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
