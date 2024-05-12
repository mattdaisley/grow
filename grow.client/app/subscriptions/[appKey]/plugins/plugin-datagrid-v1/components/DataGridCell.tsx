"use client";
import { Collection } from "../../../store/domain/Collection";
import useCollections from "../../../store/useCollections";
import useRecords, { RecordsFieldRequest } from "../../../store/useRecords";
import { Record } from "./../../../store/domain/Record";
import { CellInput } from "./CellInput";

export function DataGridCell({ record, field, editable }) {
  // console.log("DataGridCell", field, editable);
  const useRecordsResults = useRecords({
    [field.name]: { record },
  });
  // console.log("DataGridCell", useRecordsResults, field, editable);

  return (
    <>
      {editable ? (
        <DataGridCellEdit useRecordsResults={useRecordsResults} field={field} />
      ) : (
        <DataGridCellValue
          useRecordsResults={useRecordsResults}
          field={field}
        />
      )}
    </>
  );
}

function DataGridCellEdit({ useRecordsResults, field }) {
  // console.log("DataGridCellEdit", useRecordsResults, field);

  const { record, value, rawValue, onChange } = useRecordsResults[field.name];
  // console.log(
  //   "DataGridCellEdit",
  //   field.name,
  //   record,
  //   value,
  //   rawValue,
  //   onChange
  // );

  if (onChange === undefined || value === undefined) {
    return null;
  }

  if (field.type === "app_list") {
    const appListCollection = value._app?.getAppDisplayList();

    if (!appListCollection) {
      return null;
    }

    // console.log(
    //   "DataGridCellEdit appListCollection",
    //   appListCollection,
    //   rawValue,
    //   value,
    //   onChange
    // );
    return <>All Apps</>;
    // return (
    //   <CellSelectAppList
    //     appListCollection={appListCollection}
    //     value={rawValue}
    //     onChange={onChange}
    //   />
    // );
  }

  if (field.type == "app_plugins") {
    return <>All Plugins</>;
  }

  if (field.type === "app_plugin_list") {
    // console.log("DataGridCellEdit app_plugin_list", value);
    return (
      <CellSelectPluginRecordKey
        app={value._app}
        value={value.key}
        onChange={onChange}
      />
    );
  }

  if (field.type === "app_collection_list") {
    // console.log("DataGridCellEdit app_collection_list", value, onChange);
    return (
      <CellSelect
        optionRecords={value.records}
        value={value.key}
        onChange={onChange}
      />
    );
  }

  if (field.type === "collection") {
    const collection = value._app?.getCollectionDisplayList();

    if (!collection) {
      return null;
    }

    // console.log("DataGridCellEdit collection", collection, value, onChange);
    return (
      <CellSelectCollectionList
        collectionListCollection={collection}
        value={value.key}
        onChange={onChange}
      />
    );
  }

  if (field.type === "record_key") {
    // console.log("DataGridCellEdit record_key", record, value);
    return (
      <CellSelectRecordKeyWrapper
        record={record}
        rawValue={rawValue}
        value={value}
        readonly={field.readonly}
        onChange={onChange}
      />
    );
  }

  return (
    <CellInput value={rawValue} onChange={onChange} readonly={field.readonly} />
  );
}

function CellSelectRecordKeyWrapper({
  record,
  rawValue,
  value,
  readonly,
  onChange,
}) {
  const recordsFieldRequest: RecordsFieldRequest = {
    components: { record },
  };
  const { components } = useRecords(recordsFieldRequest);
  // console.log(
  //   "CellSelectRecordKeyWrapper record_key",
  //   components?.value,
  //   components?.rawValue,
  //   components?.value === "plugin_key"
  // );

  if (components?.value === undefined) {
    // the record does not have components so just render an input
    // console.log("CellSelectRecordKeyWrapper no components", rawValue);
    return (
      <CellInput value={rawValue} onChange={onChange} readonly={readonly} />
    );
  }

  // if (components.value === "plugin_key") {
  //   return (
  //     <CellSelectPluginRecordKey
  //       app={record._app}
  //       value={value}
  //       onChange={onChange}
  //     />
  //   );
  // }

  return (
    <CellSelectRecordKey
      components={components.value}
      value={value}
      onChange={onChange}
    />
  );
}

function CellSelectRecordKey({ components, value, onChange }) {
  const listItems = useCollections([components]);
  // console.log("CellSelectRecordKey", listItems, value);
  if (!listItems || !listItems[components.key]?.records) {
    return null;
  }

  const optionRecords = listItems[components.key]?.records;
  if (!optionRecords.hasOwnProperty(value)) {
    // console.log(
    //   "CellSelectRecordKey",
    //   optionRecords,
    //   value,
    //   typeof value,
    //   onChange
    // );
    return <CellInput value={value} onChange={onChange} readonly={false} />;
  }

  return (
    <CellSelect
      optionRecords={listItems[components.key]?.records}
      value={value}
      onChange={onChange}
    />
  );
}

function CellSelectPluginRecordKey({ app, value, onChange }) {
  const pluginListCollection = app?.getPluginDisplayList();
  // console.log(
  //   "CellSelectPluginRecordKey",
  //   pluginListCollection,
  //   value,
  //   onChange
  // );

  if (!pluginListCollection) {
    return null;
  }

  return (
    <CellSelectPluginList
      pluginListCollection={pluginListCollection}
      value={value}
      onChange={onChange}
    />
  );
}

function CellSelectAppList({ appListCollection, value, onChange }) {
  const listItems = useCollections([appListCollection]);
  // console.log("CellSelectAppList", listItems, value);
  if (!listItems || !listItems[appListCollection.key]?.records) {
    return null;
  }

  // return <>CellSelectAppList</>;
  return (
    <CellSelect
      optionRecords={listItems[appListCollection.key]?.records}
      value={value}
      onChange={onChange}
    />
  );
}

function CellSelectPluginList({ pluginListCollection, value, onChange }) {
  const listItems = useCollections([pluginListCollection]);
  // console.log("CellSelectPluginList", listItems, value);
  if (!listItems || !listItems[pluginListCollection.key]?.records) {
    return null;
  }

  const optionRecords = listItems[pluginListCollection.key]?.records;

  // return <>CellSelectPluginList</>;
  return (
    <CellSelect
      optionRecords={optionRecords}
      value={value}
      onChange={onChange}
    />
  );
}

function CellSelectCollectionList({
  collectionListCollection,
  value,
  onChange,
}) {
  const listItems = useCollections([collectionListCollection]);
  // console.log("CellSelectPluginList", listItems, value);
  if (!listItems || !listItems[collectionListCollection.key]?.records) {
    return null;
  }
  // return <>CellSelectCollectionList</>;
  return (
    <CellSelect
      optionRecords={listItems[collectionListCollection.key]?.records}
      value={value}
      onChange={onChange}
    />
  );
}

function CellSelect({
  optionRecords,
  value,
  onChange,
}: {
  optionRecords: { [key: string]: Record };
  value: string | number;
  onChange: Function;
}) {
  let optionsList = optionRecords || {};
  let numberKey = typeof value === "number";

  // console.log("CellSelect", optionsList, value);

  return (
    <select
      style={{ width: "100%" }}
      value={value}
      onChange={(e) => onChange && onChange(String(e.target.value))}
    >
      <option>None</option>
      {Object.entries(optionsList || {})
        .sort(([_a, a]: any, [_b, b]: any) => {
          // console.log(a, b);
          if (a.value.display_name < b.value.display_name) {
            return -1;
          }
          if (a.value.display_name > b.value.display_name) {
            return 1;
          }
          return 0;
        })
        .map(([key, record]: [string, any]) => (
          <option key={key} value={numberKey ? Number(key) : key}>
            {record?.value.display_name || ""}
          </option>
        ))}
    </select>
  );
}

function DataGridCellValue({ useRecordsResults, field }) {
  // console.log("DataGridRow", useRecordsResults);
  const { value } = useRecordsResults[field.name];
  // console.log("DataGridRowValue", field.name, value, field, useRecordsResults);

  // console.log("DataGridRowValue", fieldValue);

  if (field.type === "collection") {
    return (
      <>
        {value?.key} - {value?.schema?.display_name}
      </>
    );
  }

  if (field.type === "app_plugin_list") {
    return <>{value?.value?.display_name}</>;
  }

  return <>{value?.toString()}</>;
}
