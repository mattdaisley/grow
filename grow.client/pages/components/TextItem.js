import { useState } from 'react';
import { Controller } from "react-hook-form";

import TextField from '@mui/material/TextField';
import { NumberFormatCustom } from './NumberFormatCustom';
import { Item } from './index';

export const TextItem = ({ appField, control }) => {
  const [value, setValue] = useState("");

  const handleFieldChanged = (event) => {
    const targetValue = event.target.value;
    setValue(targetValue);
  };

  let inputProps = {};
  const { prefix, thousandsGroupStyle, thousandSeparator, decimalScale, ...props } = appField.props;
  if (appField.type === 'numeric') {
    inputProps.inputComponent = NumberFormatCustom;
    inputProps.inputProps = {
      prefix: prefix ?? "",
      thousandsGroupStyle: thousandsGroupStyle ?? "thousand",
      thousandSeparator: thousandSeparator ?? ",",
      decimalScale: decimalScale ?? 2
    }
  }

  const textControl = (
    <Controller
      name={`testform.0.${appField.name}`}
      control={control}
      render={({ field }) => {
        // console.log(field);
        return <TextField
          fullWidth={true}
          size="small"
          {...props}
          // value={value}
          // onChange={handleFieldChanged}
          {...field}
          InputProps={inputProps}
        />
      }
      } />

  );

  return <Item>{textControl}</Item>;
};
