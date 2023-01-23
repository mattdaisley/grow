import { Controller } from "react-hook-form";

import Typography from '@mui/material/Typography';

import { Item } from './Item';

export const LabelItem = ({ appField, control, fieldArrayName }) => {

  const props = appField.props;

  const textControl = (
    <Controller
      name={`${fieldArrayName}.${appField.name}`}
      control={control}
      render={({ field }) => {
        // console.log(field);
        return <Typography
          {...props}
        >
          {field.value ?? appField.default}
        </Typography>
      }} />

  );

  return <Item>{textControl}</Item>;
};
