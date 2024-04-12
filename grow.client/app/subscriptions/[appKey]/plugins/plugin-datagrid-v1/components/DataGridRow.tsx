"use client";
import useRecords from "../../../store/useRecords";

export function DataGridRow({ record, field, editable }) {
  const useRecordsResults = useRecords({
    [field.name]: { record },
  });

  if (
    !useRecordsResults ||
    Object.keys(useRecordsResults).length === 0 ||
    Object.values(useRecordsResults).filter(
      (useRecordsResult) => useRecordsResult === undefined
    ).length > 0
  ) {
    return null;
  }

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

  if (field.type === "collection") {
    const collection = useRecordsResults[field.name].value;

    const collectionDisplayList =
      collection?._app?.getCollectionDisplayList() || {};

    // console.log("DataGridRow", useRecordsResults, collectionDisplayList, field);

    return (
      <select
        style={{ width: "100%" }}
        value={collection.key}
        onChange={(e) =>
          useRecordsResults[field.name]?.onChange(String(e.target.value))
        }
      >
        {Object.entries(collectionDisplayList)
          .sort((a: any, b: any) => {
            if (a[1].display_name < b[1].display_name) {
              return -1;
            }
            if (a[1].display_name > b[1].display_name) {
              return 1;
            }
            return 0;
          })
          .map(([key, value]: [string, any]) => (
            <option key={key} value={Number(key)}>
              {value?.display_name || ""}
            </option>
          ))}
      </select>
    );
  }

  return (
    <input
      value={useRecordsResults[field.name]?.value}
      onChange={(e) => useRecordsResults[field.name]?.onChange(e.target.value)}
    />
  );
}

function DataGridCellValue({ useRecordsResults, field }) {
  // console.log("DataGridRow", useRecordsResults);
  const fieldValue = useRecordsResults[field.name].value;
  // console.log("DataGridRowValue", field, fieldValue, useRecordsResults);

  // console.log("DataGridRowValue", fieldValue);

  if (field.type === "collection") {
    return (
      <>
        {fieldValue.key} - {fieldValue.schema?.display_name}
      </>
    );
  }

  return <>{useRecordsResults[field.name].value}</>;
}
