import { useFormContext } from "react-hook-form";

import Typography from '@mui/material/Typography';

import { Item } from '../Item';

export const LabelItem = ({ appField, fieldArrayName }) => {

  const props = appField.props;

  const pageFormContext = useFormContext();

  let label = pageFormContext.watch(`${fieldArrayName}.${appField.computed}`);
  // console.log(label)

  if (label === undefined || label === "") {
    label = appField.default
  }

  return (
    <Item>
      <Typography
        {...props}
      >
        {label}
      </Typography>
    </Item>
  );
};
