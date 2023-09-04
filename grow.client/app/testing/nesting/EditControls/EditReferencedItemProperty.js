'use client';
import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import logger from "../../../../services/logger";
import { FieldWrapper } from "../FieldItem";
import { useSubscription } from "../useSubscription";

export function EditReferencedItemProperty({ ...props }) {

  const [itemValue, setItemValue] = useState({ value: null, label: "" });
  const existingItems = useSubscription({ ...props, itemKey: props.itemKey, keyPrefix: undefined });

  logger.log('EditReferencedItemProperty', 'props:', props, 'existingItems:', existingItems);

  if (existingItems === undefined) {
    return null;
  }

  const handleItemValueChange = (_, newValue) => {
    // logger.log('EditReferencedItemProperty handleItemValueChange', newValue)
    let value = newValue;

    if (newValue === null) {
      value = { value: null, label: "" };
    }

    setItemValue(value);
    props.onChange && props.onChange(value.value);
  };

  const handleItemTextChange = (event) => {
    setItemValue({ ...itemValue, label: event.target.value ?? "" });
  };

  let label = props.itemKey.substring(0, props.itemKey.length - 1);
  label = `${label.substring(0, 1).toUpperCase()}${label.substring(1)}`;

  const options = [];
  existingItems.forEach((values, existingItemKey) => {
    let label = values.get('label');
    if (label === undefined || label === "") {
      label = values.get('name');
    }
    options.push({ value: existingItemKey, label });
  });

  return (
    <>
      <FieldWrapper>
        <Autocomplete
          autoComplete
          autoSelect
          autoHighlight
          fullWidth
          size="small"
          options={options}
          value={itemValue.value}
          inputValue={itemValue.label}
          onChange={handleItemValueChange}
          isOptionEqualToValue={(option, testValue) => option?.value === testValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              onChange={handleItemTextChange} />
          )} />
      </FieldWrapper>
    </>
  );
}
