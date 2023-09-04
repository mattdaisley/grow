'use client';

import { useState } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import logger from "../../../../services/logger";
import { FieldWrapper } from "../FieldItem";
import { collectionTypes } from "../constants";
import { EditReferencedItemProperty } from "../EditControls/EditReferencedItemProperty";
import { getNextItemLabel, getNextItemName } from "./AddNewItemControl";

export function AddCollectionItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddCollectionItemControl', 'props:', props);

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddCollectionItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties);

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey;

    const keyPrefix = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey;


    let propertiesToAdd;

    propertiesToAdd = {
      ...addedProperties,
      // width: '12',
      // collections: {
      //   id: {
      //     name: addedProperties.name,
      //     label: addedProperties.label
      //   }
      // }
    };

    const itemsToAdd = {
      [keyPrefix]: propertiesToAdd
    };

    logger.log('AddCollectionItemControl props.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')');
    props.itemsMethods.addItems(itemKey, itemsToAdd);

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddCollectionItemControl handleAddItemCancelClick');
    setAddingItem(false);
  };

  return (
    <>
      {!addingItem && (
        <Box sx={{ py: 2, px: 2 }}>
          <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem('collection')}>
            Add Collection
          </Button>
        </Box>
      )}
      {addingItem === 'collection' && (
        <Box sx={{ py: 2, px: 2, width: '100%' }}>
          <AddCollectionItemProperties
            {...props}
            addingItem={addingItem}
            onAddItemConfirmClick={handleAddItemConfirmClick}
            onAddItemCancelClick={handleAddItemCancelClick} />
        </Box>
      )}
    </>
  );
}
function AddCollectionItemProperties(props) {

  const [itemLabel, setItemLabel] = useState(getNextItemLabel('collections', props.fields));
  const [itemName, setItemName] = useState(getNextItemName(itemLabel));
  const [nameChanged, setNameChanged] = useState(false);
  const [type, setType] = useState({ value: null, label: "" });
  const [referencedCollection, setReferencedCollection] = useState(null);
  logger.log('AddCollectionItemProperties', 'props:', props);


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

  const handleTypeChanged = (_, newValue) => {
    // logger.log('AddExistingItemControl handleItemValueChange', newValue)
    if (newValue === null) {
      setType({ value: null, label: "" });
    }
    else {
      setType(newValue);
    }
  };

  const handleItemTextChange = (event) => {
    setType({ ...type, label: event.target.value ?? "" });
  };

  const handelReferencedCollectionChange = (newValue) => {
    setReferencedCollection(newValue);
  };

  const handleAddItemConfirmClick = () => {
    logger.log('AddCollectionItemProperties handleAddItemConfirmClick', 'itemKey:', props.itemKey, 'type:', type, 'referencedCollection:', referencedCollection);
    props.onAddItemConfirmClick && props.onAddItemConfirmClick(
      { label: itemLabel, name: itemName, type: type.value, width: '12', collections: { id: referencedCollection } }
    );
    setType({ value: null, label: "" });
  };

  const options = collectionTypes;

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
      <EditReferencedItemProperty {...props} itemKey={'collections'} onChange={handelReferencedCollectionChange} />
      <FieldWrapper>
        <Autocomplete
          label={props.itemKey}
          autoComplete
          autoSelect
          autoHighlight
          fullWidth
          size="small"
          options={options}
          value={type.value}
          inputValue={type.label}
          onChange={handleTypeChanged}
          isOptionEqualToValue={(option, testValue) => option?.value === testValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.type}
              onChange={handleItemTextChange} />
          )} />
      </FieldWrapper>
      <Button
        color="secondary"
        size="small"
        sx={{ mt: 1 }}
        disabled={type.value === null || referencedCollection === null}
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
