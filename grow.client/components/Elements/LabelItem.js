import { Controller } from "react-hook-form";

import Typography from '@mui/material/Typography';

import { Item } from '../Item';

export const LabelItem = ({ appField, control, fieldArrayName }) => {

  const props = appField.props;

  const textControl = (
    <Controller
      name={`${fieldArrayName}.${appField.computed}`}
      control={control}
      render={({ field }) => {
        // console.log(field);
        let label = field.value;
        if (label === undefined || label === "") {
          label = appField.default
        }

        return <Typography
          {...props}
        >
          {label}
        </Typography>
      }} />

  );

  return <Item>{textControl}</Item>;
};
