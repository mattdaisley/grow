"use client";
import { Collection } from "../../../store/domain/Collection";
import useCollections from "../../../store/useCollections";
import useRecords from "../../../store/useRecords";
import { Record } from "./../../../store/domain/Record";

export function DataGridCell({ record, field, editable }) {
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

  const { value, rawValue, onChange } = useRecordsResults[field.name];

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
    //   value,
    //   onChange
    // );
    return (
      <CellSelectAppList
        appListCollection={appListCollection}
        value={value.key}
        onChange={onChange}
      />
    );
  }

  if (field.type === "app_plugin_list") {
    const pluginListCollection = value._app?.getPluginDisplayList();

    if (!pluginListCollection) {
      return null;
    }

    // console.log(
    //   "DataGridCellEdit pluginListCollection",
    //   pluginListCollection,
    //   value,
    //   onChange
    // );
    return (
      <CellSelectPluginList
        pluginListCollection={pluginListCollection}
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

  return (
    <input
      value={rawValue}
      onChange={(e) => onChange(e.target.value)}
      disabled={field.readonly}
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

  // return <>CellSelectPluginList</>;
  return (
    <CellSelect
      optionRecords={listItems[pluginListCollection.key]?.records}
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

  // console.log("CellSelect", value, optionsList);

  return (
    <select
      style={{ width: "100%" }}
      value={value}
      onChange={(e) => onChange && onChange(String(e.target.value))}
    >
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
  // console.log("DataGridRowValue", field, value, useRecordsResults);

  // console.log("DataGridRowValue", fieldValue);

  if (field.type === "collection") {
    return (
      <>
        {value?.key} - {value?.schema?.display_name}
      </>
    );
  }

  return <>{value?.toString()}</>;
}
