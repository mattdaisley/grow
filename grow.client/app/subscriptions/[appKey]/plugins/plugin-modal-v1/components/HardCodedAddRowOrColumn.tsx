"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { App } from "../../../store/domain/App";
import useAppState from "../../../store/useAppState";

export function HardCodedAddRowOrColumn({ components }) {
  const { selectedRecord } = useAppState("selectedRecord");

  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState("");

  // console.log("HardCodedAddRow", selectedRecord?.value);

  if (selectedRecord?.value === undefined) {
    return null;
  }

  const handleAddColumnClick = () => {
    const collectionKey: string = selectedRecord.value.toString();
    const app: App = components.value._app;

    const newField = {
      name: columnName,
      type: columnType,
    };

    app.pushCollectionShemaFieldCreate(collectionKey, newField);

    // console.log("Add Column button clicked", collectionKey, newField);
  };

  const handleAddRowClick = () => {
    const collectionKey: string = selectedRecord.value.toString();
    const app: App = components.value._app;
    app.pushRecordCreate(collectionKey);

    // console.log("Add Row button clicked", collectionKey);
  };

  return (
    <>
      <div>
        <TextField
          fullWidth
          label="Column Name"
          onChange={(e) => {
            setColumnName(e.target.value);
          }}
        />
      </div>
      <div>
        <TextField
          fullWidth
          label="Column Type"
          onChange={(e) => {
            setColumnType(e.target.value);
          }}
        />
      </div>
      <div>
        <Button fullWidth onClick={handleAddColumnClick}>
          Add Column
        </Button>
      </div>
      <div>
        <Button fullWidth onClick={handleAddRowClick}>
          Add Row
        </Button>
      </div>
    </>
  );
}
