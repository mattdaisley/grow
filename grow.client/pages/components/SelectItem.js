import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Item } from './index';

export const SelectItem = ({ field }) => {
  const [value, setValue] = useState("");

  const handleFieldChanged = (event) => {
    const targetValue = event.target.value;
    setValue(targetValue);
  };

  const { options, ...props } = field.props;
  const selectControl = <Select
    size="small"
    {...props}
    labelId={`select-${field.id}-label`}
    id={`select-${field.id}`}
    value={value}
    onChange={handleFieldChanged}
  >
    {options?.map((option, j) => {
      return <MenuItem key={j} value={option.value}>
        {option.label}
      </MenuItem>;
    })}
  </Select>;

  return <Item>
    {!!field.props.label
      ? (
        <FormControl fullWidth={true} {...field.props}>
          <InputLabel
            size="small"
            id={`select-${field.id}-label`}>{field.props.label}</InputLabel>
          {selectControl}
        </FormControl>
      )
      : { selectControl }}
  </Item>;
};
