"use client";
import useRecords from "../../../store/useRecords";

export function DataGridRow({ record, field }) {
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

  // console.log("DataGridRow", useRecordsResults);
  const fieldValue = useRecordsResults[field.name].value;

  if (field.type === "collection") {
    return (
      <>
        {fieldValue.key} - {fieldValue.schema.display_name}
      </>
    );
  }

  return <>{useRecordsResults[field.name].value}</>;
}
