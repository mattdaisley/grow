import { Controller } from "react-hook-form";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { Item } from './Item';

export const AutocompleteItem = ({ appField, control, fieldArrayName }) => {

  const { key, ...fieldProps } = appField.props;

  return <Item>
    <Controller
      name={`${fieldArrayName}.${appField.name}`}
      control={control}
      render={({ field: { value, onChange } }) => {

        return <Autocomplete
          fullWidth
          size="small"
          {...fieldProps}
          id={`autocomplete-${appField.id}`}
          getOptionLabel={(option) => option.label ?? ""}
          value={value}
          onChange={(_, newValue) => onChange(newValue)}
          isOptionEqualToValue={(option, testValue) => option.label === testValue.label}
          renderInput={(params) => <TextField {...params} label={fieldProps.label} />}
        />
      }} />
  </Item>;
};
