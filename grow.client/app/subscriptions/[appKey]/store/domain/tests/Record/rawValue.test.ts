import '@testing-library/jest-dom'
import { App } from '../../App'; // Adjust the import path as necessary
import { Collection } from '../../Collection'
import { Record } from '../../Record'
import { ISchema } from '../../ISchema';
import { AppService } from '../../AppService';
 
class MockAppService extends AppService {

  public subscribe(selector: string, callback: Function): void {
      // do nothing
  }
}

class MockApp extends App {
  
}

class MockCollection extends Collection {
  
}

describe("Record.rawValue", () => {
  let appService, app, collection;

  beforeEach(() => {
    appService = new MockAppService("1", undefined);
    app = new MockApp(
      { key: "1", plugins: {}, collections: {} },
      appService
    );
    collection = new MockCollection(app, {
      key: "1",
      schema: {},
      records: {},
      type: "collection",
    });
  });

  it("returns correct defaults", () => {
    const schema: ISchema = {
      name: "test_collection",
      fields: {
        guid1: {
          type: "string",
          name: "stringField",
        },
        guid2: {
          type: "number",
          name: "numberField",
        },
        guid3: {
          type: "boolean",
          name: "booleanField",
        },
        guid4: {
          type: "app",
          name: "appField",
        },
        guid5: {
          type: "app_collection",
          name: "appCollectionField",
        },
        guid6: {
          type: "app_collection_list",
          name: "appCollectionListField",
        },
        guid7: {
          type: "app_list",
          name: "appListField",
        },
        guid8: {
          type: "collection_field_key",
          name: "collectionFieldKeyField",
        },
        guid9: {
          type: "collection_field_list",
          name: "collectionFieldListField",
        },
        guid10: {
          type: "collection_record_list",
          name: "collectionRecordListField",
        },
        guid11: {
          type: "record_key",
          name: "recordKeyField",
        },
        guid12: {
          type: "referenced_field",
          name: "referencedField",
        },
        guid13: {
          type: "app_plugin_list",
          name: "appPluginListField",
        },
      },
      display_name: "Tests/Collection",
    };

    const rawRecord = {};

    const record = new Record(app, collection, {
      schema,
      key: "1",
      record: rawRecord,
    });

    const actualRawValue = record.rawValue;
    const expectedRawValue = {
      stringField: "",
      numberField: 0,
      booleanField: false,
      appField: "",
      appCollectionField: "",
      appCollectionListField: "",
      appListField: "",
      collectionFieldKeyField: "",
      collectionFieldListField: "",
      collectionRecordListField: "",
      recordKeyField: "",
      referencedField: "",
      appPluginListField: {
        "_app": app,
        key: "None",
        type: "plugin",
        value: { display_name: "None" }
      },
    };

    expect(actualRawValue).toEqual(expectedRawValue);
  });

  it("returns date fields as locale strings", () => {
    const schema: ISchema = {
      name: "test_collection",
      fields: {
        createdDate: {
          type: "createdDate",
          name: "createdDateField",
        },
        updatedDate: {
          type: "updatedDate",
          name: "updatedDateField",
        },
      },
      display_name: "Tests/Collection",
    };

    const rawRecord = {
      createdDate: "2021-01-01T12:00:00Z",
      updatedDate: "2021-01-01T12:00:00Z",
    };

    const record = new Record(app, collection, {
      schema,
      key: "1",
      record: rawRecord,
    });

    const actualRawValue = record.rawValue;
    const expectedRawValue = {
      createdDate: "1/1/2021, 5:00:00 AM",
      updatedDate: "1/1/2021, 5:00:00 AM",
    };

    expect(actualRawValue).toEqual(expectedRawValue);
  });

  it("returns raw values from rawRecord", () => {
    const schema: ISchema = {
      name: "test_collection",
      fields: {
        guid1: {
          type: "string",
          name: "stringField",
        },
        guid2: {
          type: "number",
          name: "numberField",
        },
        guid3: {
          type: "boolean",
          name: "booleanField",
        },
        guid4: {
          type: "app",
          name: "appField",
        },
        guid5: {
          type: "app_collection",
          name: "appCollectionField",
        },
        guid6: {
          type: "app_collection_list",
          name: "appCollectionListField",
        },
        guid7: {
          type: "app_list",
          name: "appListField",
        },
        guid8: {
          type: "collection_field_key",
          name: "collectionFieldKeyField",
        },
        guid9: {
          type: "collection_field_list",
          name: "collectionFieldListField",
        },
        guid10: {
          type: "collection_record_list",
          name: "collectionRecordListField",
        },
        guid11: {
          type: "record_key",
          name: "recordKeyField",
        },
        guid12: {
          type: "referenced_field",
          name: "referencedField",
        },
        guid13: {
          type: "app_plugin_list",
          name: "appPluginListField",
        },
      },
      display_name: "Tests/Collection",
    };

    const rawRecord = {
      guid1: "test string",
      guid2: "1",
      guid3: true,
      guid4: "a.1",
      guid5: "a.1.c.1",
      guid6: "a.1.c.2",
      guid7: "a",
      guid8: "a.1.c.3.f.1",
      guid9: "a.1.c.3",
      guid10: "a.1.c.4",
      guid11: "a.1.c.4.r.1",
      guid12: "a.1.c.4.r.2",
      guid13: "a.1",
    };

    const record = new Record(app, collection, {
      schema,
      key: "1",
      record: rawRecord,
    });

    const actualRawValue = record.rawValue;
    const expectedRawValue = {
      stringField: "test string",
      numberField: "1",
      booleanField: true,
      appField: "a.1",
      appCollectionField: "a.1.c.1",
      appCollectionListField: "a.1.c.2",
      appListField: "a",
      collectionFieldKeyField: "a.1.c.3.f.1",
      collectionFieldListField: "a.1.c.3",
      collectionRecordListField: "a.1.c.4",
      recordKeyField: "a.1.c.4.r.1",
      referencedField: "a.1.c.4.r.2",
      appPluginListField: {
        _app: app,
        key: "a.1",
        type: "plugin",
        value: { display_name: "a.1" },
      },
    };

    expect(actualRawValue).toEqual(expectedRawValue);
  });
});