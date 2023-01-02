import { Controller } from "react-hook-form";

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { Item } from './index';

export const AutocompleteItem = ({ appField, control, fieldArrayName }) => {
  return <Item>
    <Controller
      name={`${fieldArrayName}.0.${appField.name}`}
      control={control}
      render={({ field: { value, onChange } }) => {

        return <Autocomplete
          fullWidth
          size="small"
          {...appField.props}
          id={`autocomplete-${appField.id}`}
          getOptionLabel={(option) => option.label ?? ""}
          value={value}
          onChange={(_, newValue) => onChange(newValue)}
          isOptionEqualToValue={(option, testValue) => option.label === testValue.label}
          renderInput={(params) => <TextField {...params} label={appField.props.label} />}
        />
      }} />
  </Item>;
};
