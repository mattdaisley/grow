import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Item } from './index';

export const AutocompleteItem = ({ field }) => {
  const [value, setValue] = useState(null);

  const handleFieldChanged = (event, newValue) => {
    setValue(newValue);
  };
  return <Item>
    <Autocomplete
      fullWidth
      size="small"
      {...field.props}
      id={`autocomplete-${field.id}`}
      value={value}
      onChange={handleFieldChanged}
      renderInput={(params) => <TextField {...params} label={field.props.label} />}
      getOptionLabel={(option) => option.label ?? ""} />
  </Item>;
};
