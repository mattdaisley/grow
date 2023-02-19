import { useState } from 'react';
import { Controller, useFormContext } from "react-hook-form";

import TextField from '@mui/material/TextField';

import { NumberFormatCustom } from '../../../components/Elements/util/NumberFormatCustom';
import logger from '../../../../grow.api/src/logger';


export default function TextFormControl({ name, data, ...props }) {

  logger.log('TextFormControl', name, data, props)

  const controllerName = (name !== undefined) ? `${name}.${data.name}` : data.name;

  // const formMethods = useFormContext();
  // const fields = pageFormContext.watch();

  let inputProps = {};
  const { prefix, thousandsGroupStyle, thousandSeparator, decimalScale, ...rest } = data ?? {};
  if (data.type === 'numeric') {
    inputProps.inputComponent = NumberFormatCustom;
    inputProps.inputProps = {
      prefix: prefix ?? "",
      thousandsGroupStyle: thousandsGroupStyle ?? "thousand",
      thousandSeparator: thousandSeparator ?? ",",
      decimalScale: decimalScale !== undefined ? Number(decimalScale) : 2
    }
  }
  let defaultValue = data.default ?? ""

  const componentProps = { ...rest.data, label: data.label }

  return (
    <Controller
      name={controllerName}
      control={props.formMethods.control}
      defaultValue={defaultValue}
      render={({ field }) => {
        // logger.log(field);
        return <>
          <TextField
            fullWidth={true}
            size="small"
            sx={{ fontSize: 'small' }}
            InputProps={inputProps}
            {...componentProps}
            {...field}
            value={field?.value ?? ""}
          />
        </>
      }}
    />
  )
};
