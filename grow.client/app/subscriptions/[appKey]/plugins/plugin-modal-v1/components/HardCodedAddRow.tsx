"use client";

import { Button, TextField } from "@mui/material";
import { App } from "../../../store/domain/App";
import useAppState from "../../../store/useAppState";

export function HardCodedAddRow({ components }) {
  const { selectedRecord } = useAppState("selectedRecord");

  // console.log("HardCodedAddRow", selectedRecord?.value);

  if (selectedRecord?.value === undefined) {
    return null;
  }

  const handleButtonClick = () => {
    const collectionKey: string = selectedRecord.value.toString();
    const app: App = components.value._app;
    app.pushRecordCreate(collectionKey);

    // console.log("Add button clicked", collectionKey);
  };

  return (
    <>
      <div>
        <Button fullWidth onClick={handleButtonClick}>
          Add
        </Button>
      </div>
    </>
  );
}
