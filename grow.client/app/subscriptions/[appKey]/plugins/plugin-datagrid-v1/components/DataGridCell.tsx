"use client";
import useRecords from "../../../store/useRecords";

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
  // console.log("DataGridRow", useRecordsResults, field);

  const { value, onChange } = useRecordsResults[field.name];

  if (onChange === undefined) {
    return null;
  }

  if (field.type === "collection") {
    const collection = value;

    if (!collection) {
      return null;
    }

    return <CellSelect collection={collection} onChange={onChange} />;
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={field.readonly}
    />
  );
}

function CellSelect({ collection, onChange }) {
  const collectionDisplayList =
    collection?._app?.getCollectionDisplayList() || {};

  // console.log("DataGridRow", useRecordsResults, collectionDisplayList, field);

  return (
    <select
      style={{ width: "100%" }}
      value={collection.key}
      onChange={(e) => onChange && onChange(String(e.target.value))}
    >
      {Object.entries(collectionDisplayList.records || {})
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
          <option key={key} value={Number(key)}>
            {record?.value.display_name || ""}
          </option>
        ))}
    </select>
  );
}

function DataGridCellValue({ useRecordsResults, field }) {
  // console.log("DataGridRow", useRecordsResults);
  const { value } = useRecordsResults[field.name];
  // console.log("DataGridRowValue", field, fieldValue, useRecordsResults);

  // console.log("DataGridRowValue", fieldValue);

  if (field.type === "collection") {
    return (
      <>
        {value?.key} - {value?.schema?.display_name}
      </>
    );
  }

  return <>{value}</>;
}
