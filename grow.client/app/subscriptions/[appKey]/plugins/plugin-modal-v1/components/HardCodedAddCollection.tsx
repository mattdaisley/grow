"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { App } from "../../../store/domain/App";
import useAppState from "../../../store/useAppState";

export function HardCodedAddCollection({ components }) {
  const [collectionName, setCollectionName] = useState("");
  const [collectionDisplayName, setCollectionDisplayName] = useState("");

  // console.log("HardCodedAddRow", selectedRecord?.value);

  const handleAddCollectionClick = () => {
    const app: App = components.value._app; // Assume current app but need to change to selected app

    const newCollection = {
      name: collectionName,
      displayName: collectionDisplayName,
    };

    app.pushCollectionCreate(newCollection);

    console.log("Add Collection button clicked", newCollection);
  };

  return (
    <>
      <div>
        <TextField
          fullWidth
          label="Collection Display Name"
          value={collectionDisplayName}
          onChange={(e) => {
            setCollectionDisplayName(e.target.value);
            setCollectionName(e.target.value.toLowerCase().replace(" ", "_"));
          }}
        />
      </div>
      <div>
        <TextField
          fullWidth
          label="Collection Name"
          value={collectionName}
          onChange={(e) => {
            setCollectionName(e.target.value);
          }}
        />
      </div>
      <div>
        <Button fullWidth onClick={handleAddCollectionClick}>
          Add Collection
        </Button>
      </div>
    </>
  );
}
