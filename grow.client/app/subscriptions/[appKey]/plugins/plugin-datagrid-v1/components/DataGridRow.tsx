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
  return (
    <input
      value={useRecordsResults[field.name]?.value}
      onChange={(e) => useRecordsResults[field.name]?.onChange(e.target.value)}
    />
  );
}

function DataGridCellValue({ useRecordsResults, field }) {
  console.log("DataGridRow", useRecordsResults);
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
