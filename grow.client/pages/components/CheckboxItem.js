import { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Item } from './index';

export const CheckboxItem = ({ field }) => {
  const [value, setValue] = useState(false);

  const handleFieldChanged = (event) => {
    const targetValue = event.target.checked;
    setValue(targetValue);
  };

  const checkboxControl = <Checkbox
    size="small"
    {...field?.props}
    checked={value}
    onChange={handleFieldChanged}
  />;

  return <Item>
    {!!field?.props.label
      ? (
        <FormControl>
          <FormControlLabel
            label={field.props.label}
            control={checkboxControl} />
        </FormControl>
      )
      : checkboxControl}
  </Item>;
};
