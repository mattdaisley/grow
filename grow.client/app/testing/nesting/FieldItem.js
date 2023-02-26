'use client';
import { Children, cloneElement, isValidElement } from "react";
import { Controller } from "react-hook-form";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { styled } from '@mui/material/styles';
import TextField from "@mui/material/TextField";

import logger from "../../../../grow.api/src/logger";

export function FieldItem({ render, ...props }) {
  logger.log('FieldItem', props);

  const handleChange = (onChange) => {

    const onChangeCallback = (event, newValue) => {
      logger.log('FieldItem calling form onChange', event?.target?.value, newValue);
      onChange(event, newValue);
    };

    return (event, newValue) => {
      props.itemsMethods.broadcast(props.contextKey ?? props.itemKey, props.name, event, newValue);
      onChangeCallback(event, newValue);
    };
  };

  return render({ ...props, onChange: handleChange });
}
export function ControlledField(props) {
  switch (props.type) {
    case "0":
      return <ControlledTextField {...props} />;
    case "1":
      return <ControlledAutocompleteField {...props} />;
  }

  return null;
}
export function ControlledTextField({ name, ...props }) {

  const defaultValue = props.itemsMethods.getData(name) ?? "";
  const label = props.label ?? name;

  // logger.log('ControlledTextField', 'name:', name, 'defaultValue:', defaultValue, 'props:', props);

  return (
    <Controller
      control={props.itemsMethods.formMethods.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) => {
        // logger.log('render TextField', controllerName)
        const handleChange = props.onChange(onChange);

        return (
          <TextField
            label={label}
            size="small"
            sx={{ fontSize: 'small' }}
            fullWidth
            {...props.inputProps}
            value={value}
            onChange={handleChange} />
        );
      }} />
  );
}
export function ControlledAutocompleteField({ name, ...props }) {

  const defaultValue = props.itemsMethods.getData(name) ?? props.defaultValue ?? null;
  const label = props.label ?? name;

  // logger.log('ControlledAutocompleteField', 'name:', name, 'defaultValue:', defaultValue, 'props:', props);

  const menuItems = props.menuItems ?? [{ value: '0', label: 'test0' }, { value: '1', label: 'test1' }, { value: '2', label: 'test2' },
  { value: '3', label: 'test3' }, { value: '4', label: 'test4' }, { value: '5', label: 'test5' }];

  const componentProps = {
    autoComplete: true,
    autoSelect: true,
    autoHighlight: true,
    options: menuItems
  };

  function getSelectedItem(menuItems, value) {
    return menuItems?.find(item => item.value === value) ?? null;
  }

  return (
    <Controller
      control={props.itemsMethods.formMethods.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) => {
        logger.log('render ControlledAutocomplete', name, value);

        const handleChange = (_, newValue) => {
          logger.log('ControlledAutocomplete handleChange', newValue);
          const action = props.onChange((_, value) => {
            onChange(value);
          });
          action(_, newValue?.value ?? null);
        };

        return (
          <Autocomplete
            fullWidth
            size="small"
            sx={{ fontSize: 'small' }}
            {...componentProps}
            value={getSelectedItem(menuItems, value)}
            onChange={handleChange}
            isOptionEqualToValue={(option, testValue) => option?.id === testValue?.id}
            renderInput={(params) => (
              <TextField
                size="small"
                sx={{ fontSize: 'small' }}
                label={label}
                {...params} />
            )} />
        );
      }} />
  );
}
export const FieldWrapper = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  padding: `${theme.spacing(1)} ${theme.spacing(0)}`,
  boxSizing: 'border-box',
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));
export function ChildrenWithProps({ children, ...props }) {

  const childrenWithProps = Children.map(children, child => {
    if (isValidElement(child)) {
      const newChild = cloneElement(child, { ...props });
      return newChild;
    }
    return child;
  });

  // logger.log('ChildrenWithProps', 'render:', props.render === undefined, 'props:', props);
  if (props.render === undefined) {
    return childrenWithProps;
  }

  // logger.log('ChildrenWithProps', 'childrenWithProps:', childrenWithProps);
  return Children.map(childrenWithProps, child => {
    // logger.log('ChildrenWithProps', 'child:', child);
    return props.render(child);
  });

}
