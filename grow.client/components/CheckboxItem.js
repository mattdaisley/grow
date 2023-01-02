import { Controller } from "react-hook-form";

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Item } from './item';

export const CheckboxItem = ({ appField, control, fieldArrayName }) => {

  const checkboxControl =
    <Controller
      name={`${fieldArrayName}.0.${appField.name}`}
      control={control}
      render={({ field: { value, onChange } }) => {
        return <Checkbox
          size="small"
          {...appField?.props}
          checked={value}
          onChange={onChange}
        />
      }}
    />;

  return <Item>
    {!!appField?.props.label
      ? (
        <FormControl>
          <FormControlLabel
            label={appField.props.label}
            control={checkboxControl} />
        </FormControl>
      )
      : checkboxControl}
  </Item>;
};
