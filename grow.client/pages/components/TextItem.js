import { useState } from 'react';
import TextField from '@mui/material/TextField';
import { NumberFormatCustom } from './NumberFormatCustom';
import { Item } from './index';

export const TextItem = ({ field }) => {
  const [value, setValue] = useState("");

  const handleFieldChanged = (event) => {
    const targetValue = event.target.value;
    setValue(targetValue);
  };

  let inputProps = {};
  if (field.type === 'numeric') {
    const { prefix, thousandsGroupStyle, thousandSeparator, decimalScale } = field.props;
    inputProps.inputComponent = NumberFormatCustom;
    inputProps.inputProps = {
      prefix: prefix ?? "",
      thousandsGroupStyle: thousandsGroupStyle ?? "thousand",
      thousandSeparator: thousandSeparator ?? ",",
      decimalScale: decimalScale ?? 2
    }
  }

  const textControl = <TextField
    fullWidth={true}
    size="small"
    {...field.props}
    value={value}
    onChange={handleFieldChanged}
    InputProps={inputProps} />;

  return <Item>{textControl}</Item>;
};
