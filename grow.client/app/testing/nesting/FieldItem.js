'use client';
import { useEffect, Children, cloneElement, isValidElement } from "react";
import { Controller } from "react-hook-form";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { styled } from '@mui/material/styles';
import TextField from "@mui/material/TextField";

import { useSubscription } from "./useSubscription";
import logger from "../../../services/logger";

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
    case "2":
      return <SystemDateField {...props} />;
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


export function ControlledAutocompleteField(props) {

  const referencedCollection = useSubscription({ ...props, searchSuffix: 'options-collection' })
  const collectionFields = useSubscription({ ...props, itemKey: `collections.${referencedCollection}`, keyPrefix: undefined });

  const collectionSource = collectionFields?.get('source')

  const contextKey = props.pageContextKey ?? props.contextKey
  const collectionContextKey = collectionSource === '1' ? 'gpio-device' : `${contextKey}_collections_${(referencedCollection ?? '0')}`

  useEffect(() => {
    props.itemsMethods.getItems([collectionContextKey, 'collections']);
  }, [collectionContextKey]);

  return (
    <ControlledAutocompleteFieldComponent {...props} collectionContextKey={collectionContextKey} />
  );
}

export function ControlledAutocompleteFieldComponent({ name, collectionContextKey, ...props }) {
  logger.log('ControlledAutocompleteField', 'name:', name, 'collectionContextKey:', collectionContextKey, 'props:', props);

  const collectionFields = useSubscription({ ...props, itemKey: collectionContextKey, keyPrefix: undefined });

  const referencedLabelField = useSubscription({ ...props, searchSuffix: 'options-label' })
  const labelField = useSubscription({ ...props, itemKey: 'fields', keyPrefix: undefined, searchSuffix: referencedLabelField });

  const defaultValue = props.itemsMethods.getData(name) ?? props.defaultValue ?? null;
  const label = props.label ?? name;

  // logger.log('ControlledAutocompleteField', 'name:', name, 'defaultValue:', defaultValue, 'props:', props);
  logger.log('ControlledAutocompleteField', 'label:', label, 'labelField:', labelField, 'collectionFields:', collectionFields, 'props:', props)

  let menuItems = props.menuItems ?? []
  if (collectionFields !== undefined && labelField !== undefined) {

    const labelKey = labelField.get('name') ?? ""

    menuItems = []
    collectionFields.forEach((values, collectionKey) => {
      let label = values.get(labelKey)
      menuItems.push({ value: collectionKey, label });
    });
  }

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

export function SystemDateField({ name, ...props }) {

  const date = useSubscription({ ...props, itemKey: name, keyPrefix: undefined, searchSuffix: undefined })
  const label = props.label ?? name;

  logger.log('SystemDateField', 'name:', name, 'date:', date, 'props:', props);

  return (
    <TextField
      label={label}
      size="small"
      sx={{ fontSize: 'small' }}
      fullWidth
      {...props.inputProps}
      disabled={true}
      value={date ?? ""} />
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
      const newChild = cloneElement(child, { ...props, ...child.props });
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
