'use client';
import { useState } from "react";

import { unflatten } from "flat";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import logger from "../../../../services/logger";
import { FieldWrapper } from "../FieldItem";

export function AddNewItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddNewItemControl', 'props:', props);

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddNewItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties);

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey;

    const valueKey = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey;

    let propertiesToAdd;

    if (props.itemKey === 'apps') {
      propertiesToAdd = {
        ...addedProperties
      };
    } 
    else if (props.itemKey === 'pages' && props.contextKey === 'apps') {
      propertiesToAdd = {
        id: {
          ...addedProperties,
          sections: { label: 'Section 1', name: 'section_1', width: '12' }
        }
      };
    }
    else if (props.itemKey === 'pages') {
      propertiesToAdd = {
        ...addedProperties,
        sections: { label: 'Section 1', name: 'section_1', width: '12' }
      };
    }
    else if (props.itemKey === 'sections') {
      propertiesToAdd = {
        ...addedProperties,
        width: '12'
      };
    }
    else if (props.itemKey === 'views') {
      propertiesToAdd = {
        id: {
          ...addedProperties,
          groups: { label: 'Group 1', name: 'group_1', width: '12' }
        }
      };
    }
    else if (props.itemKey === 'groups') {
      propertiesToAdd = {
        ...addedProperties,
        width: '12'
      };
    }
    else if (props.itemKey === 'fields') {
      propertiesToAdd = {
        id: {
          ...addedProperties
        }
      };
    }
    else if (props.itemKey === 'collections') {
      propertiesToAdd = {
        ...addedProperties,
      };
    }

    const itemsToAdd = {
      [valueKey]: propertiesToAdd
    };

    props.itemsMethods.addItems(itemKey, itemsToAdd);

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddNewItemControl handleAddItemCancelClick');
    setAddingItem(false);
  };

  return (
    <>
      {!addingItem && (
        <Box sx={{ py: 2, px: 2 }}>
          <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem('new')}>
            Add New {props.itemKey.substring(0, props.itemKey.length - 1)}
          </Button>
        </Box>
      )}
      {addingItem === 'new' && (
        <Box sx={{ py: 2, px: 2, width: '100%' }}>
          <AddNewItemProperties
            {...props}
            addingItem={addingItem}
            onAddItemConfirmClick={handleAddItemConfirmClick}
            onAddItemCancelClick={handleAddItemCancelClick} />
        </Box>
      )}
    </>
  );
}
function AddNewItemProperties(props) {

  const itemFields = unflatten(props.itemsMethods.getNestedData(props.itemKey));
  logger.log('AddNewItemControl AddNewItemProperties', 'itemFields', itemFields.fields);

  const [itemLabel, setItemLabel] = useState(getNextItemLabel(props.itemKey, itemFields.fields ?? props.fields));
  const [itemName, setItemName] = useState(getNextItemName(itemLabel));
  const [nameChanged, setNameChanged] = useState(false);

  const handleLabelChanged = (event) => {
    setItemLabel(event.target.value);

    if (!nameChanged) {
      setItemName(getNextItemName(event.target.value));
    }
  };

  const handleNameChanged = (event) => {
    setItemName(event.target.value);
    setNameChanged(true);
  };

  return (
    <>
      <FieldWrapper>
        <TextField
          label="Label"
          fullWidth
          size="small"
          value={itemLabel}
          onChange={handleLabelChanged} />
      </FieldWrapper>
      <FieldWrapper>
        <TextField
          label="Name"
          fullWidth
          size="small"
          value={itemName}
          onChange={handleNameChanged} />
      </FieldWrapper>
      <Button
        color="secondary"
        size="small"
        sx={{ mt: 1 }}
        disabled={itemName === ""}
        onClick={() => props.onAddItemConfirmClick({ label: itemLabel, name: itemName })}>
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
export function getNextItemLabel(itemKey, fields) {
  const existingNames = fields !== undefined
    ? Object.keys(fields).map(field => fields[field]?.name ?? "")
    : [];
  // logger.log('AddNewItemControl', 'fields:', fields, 'existingNames:', existingNames)
  let nextItemIndex = existingNames.length + 1;
  let nextItemName = `${itemKey.substring(0, itemKey.length - 1)} ${nextItemIndex}`;
  while (existingNames.includes(nextItemName)) {
    nextItemIndex++;
    nextItemName = `${itemKey}${nextItemIndex}`;
  }

  return nextItemName.charAt(0).toUpperCase() + nextItemName.substring(1);
}
export function getNextItemName(label) {
  return label.split(' ').join('_').toLowerCase();
}
