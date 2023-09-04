'use client';

import { useState } from "react";

import Box from "@mui/material/Box";

import { ChildrenWithProps } from "../FieldItem";

export function AddItemActions({ children, ...props }) {

  const [addingItem, setAddingItem] = useState(false);

  const handleSetAddingItem = (newAddingItem) => {
    setAddingItem(newAddingItem);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <ChildrenWithProps {...props} addingItem={addingItem} setAddingItem={handleSetAddingItem}>
        {children}
      </ChildrenWithProps>
    </Box>
  );
}
