'use client';

import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import logger from "../../../../services/logger";
import { EditReferencedItemProperty } from "../EditControls/EditReferencedItemProperty";

export function AddExistingItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddExistingItemControl', 'props:', props);

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddExistingItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties);

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey;

    const keyPrefix = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey;

    const itemsToAdd = {
      [keyPrefix]: addedProperties
    };

    props.itemsMethods.addItems(itemKey, itemsToAdd);

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddExistingItemControl handleAddItemCancelClick');
    setAddingItem(false);
  };

  return (
    <>
      {!addingItem && (
        <Box sx={{ py: 2, px: 2 }}>
          <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem('existing')}>
            Add {props.itemKey.substring(0, props.itemKey.length - 1)}
          </Button>
        </Box>
      )}
      {addingItem === 'existing' && (
        <Box sx={{ py: 2, px: 2, width: '100%' }}>
          <AddExistingItemProperties
            {...props}
            addingItem={addingItem}
            onAddItemConfirmClick={handleAddItemConfirmClick}
            onAddItemCancelClick={handleAddItemCancelClick} />
        </Box>
      )}
    </>
  );
}

function AddExistingItemProperties(props) {

  const [itemValue, setItemValue] = useState(null);

  logger.log('AddExistingItemProperties', 'props:', props);

  const handleItemValueChange = (newValue) => {
    setItemValue(newValue);
  };

  const handleAddItemConfirmClick = () => {
    logger.log('AddExistingItemProperties handleAddItemConfirmClick', 'itemKey:', props.itemKey, 'itemValue:', itemValue);
    props.onAddItemConfirmClick && props.onAddItemConfirmClick(
      { id: itemValue }
    );
  };

  return (
    <>
      <EditReferencedItemProperty {...props} onChange={handleItemValueChange} />
      <Button
        color="secondary"
        size="small"
        sx={{ mt: 1 }}
        disabled={itemValue === null}
        onClick={handleAddItemConfirmClick}>
        Confirm
      </Button>
      <Button
        size="small"
        sx={{ mt: 1 }}
        onClick={props.onAddItemCancelClick}>
        Cancel
      </Button>
    </>
  );
}
