import { useState } from 'react';
import { Controller, useFormContext } from "react-hook-form";

import TextField from '@mui/material/TextField';

import { NumberFormatCustom } from '../../../components/Elements/util/NumberFormatCustom';


export default function TextFormControl({ name, ...props }) {

  // console.log('TextFormControl', name, props)

  const controllerName = (name !== undefined) ? `${name}.${props.name}` : props.name;

  const formMethods = useFormContext();
  // const fields = pageFormContext.watch();

  let inputProps = {};
  const { prefix, thousandsGroupStyle, thousandSeparator, decimalScale, ...rest } = props ?? {};
  if (props.type === 'numeric') {
    inputProps.inputComponent = NumberFormatCustom;
    inputProps.inputProps = {
      prefix: prefix ?? "",
      thousandsGroupStyle: thousandsGroupStyle ?? "thousand",
      thousandSeparator: thousandSeparator ?? ",",
      decimalScale: decimalScale !== undefined ? Number(decimalScale) : 2
    }
  }
  let defaultValue = props.default ?? ""

  return (
    <Controller
      name={controllerName}
      control={formMethods.control}
      defaultValue={defaultValue}
      render={({ field }) => {
        // console.log(field);
        return <>
          <span>{Date.now()}</span>
          <TextField
            fullWidth={true}
            size="small"
            sx={{ fontSize: 'small' }}
            // onChange={handleFieldChanged}
            {...rest.props}
            {...field}
            value={field?.value ?? ""}
            InputProps={inputProps}
          />
        </>
      }}
    />
  )
};
