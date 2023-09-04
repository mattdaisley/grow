'use client';

import { useState, useCallback, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from '@mui/material/Unstable_Grid2';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';

import logger from "../../../../services/logger";
import { FieldWrapper, FieldItem, ChildrenWithProps, ControlledTextField, ControlledAutocompleteField } from "../FieldItem";
import { collectionTypes, fieldTypes, fieldOptionsTypes, collectionSources } from "../constants";
import { useSubscription } from "../useSubscription";
import { getNestedFields } from "../Collections/useGridCollectionColumns";

export function EditItemProperties({ valueKeys, fieldKey, children, ...props }) {
  logger.log('EditItemProperties', 'valueKeys:', valueKeys, 'fieldKey:', fieldKey, 'props:', props);

  const [openFields, setOpenFields] = useState([]);

  const id = valueKeys instanceof Map ? valueKeys.get('id') : valueKeys?.id;
  if (id !== undefined) {
    return null;
  }

  const handleClick = () => {
    logger.log('EditorList handleClick', fieldKey);
    const openFieldIndex = openFields.indexOf(fieldKey);
    let currentOpenFields = [...openFields];
    if (openFieldIndex > -1) {
      currentOpenFields.splice(openFieldIndex, 1);
      setOpenFields(currentOpenFields);
    }
    else {
      currentOpenFields = currentOpenFields.filter(x => fieldKey.indexOf(x) === 0);
      setOpenFields([...currentOpenFields, fieldKey]);
    }
  };

  const isOpen = openFields?.includes(fieldKey) ?? false;

  return (
    <Grid container spacing={0} sx={{ width: '100%', m: 0 }}>
      <Box sx={{ width: '100%', py: 1 }}>

        <Collapse in={!isOpen} timeout="auto">
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <EditItemHeader {...props} onClick={handleClick} />
            <DeleteItemButton {...props} />
          </Box>
        </Collapse>

        <Collapse in={isOpen} timeout="auto">
          {isOpen && (<>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <EditItemLabel {...props} onClick={handleClick} />
              <DeleteItemButton {...props} />
            </Box>

            <Stack spacing={0} sx={{ px: 2, py: 2 }}>
              <EditProperty {...props} controllerName={`${props.keyPrefix}.name`} label="Name" />

              <ChildrenWithProps {...props} openFields={openFields}>
                {children}
              </ChildrenWithProps>
            </Stack>
          </>)}
        </Collapse>

      </Box>
    </Grid>
  );
}
function EditItemHeader({ onClick, ...props }) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const name = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'name' });
  const label = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'label' });

  logger.log('EditItemHeader', 'name:', name, 'label:', label, 'props:', props);

  if (name === undefined) {
    return null;
  }

  let primary = label ?? name;
  let secondary;
  if (primary === label) {
    secondary = name;
  }

  return (
    <ListItem
      sx={{ height: '55px' }}
      onClick={onClick}
      secondaryAction={(
        <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
          <ExpandMore />
        </ListItemIcon>
      )}>
      <ListItemText
        primary={primary}
        primaryTypographyProps={{ noWrap: true }}
        secondary={secondary}
        secondaryTypographyProps={{ noWrap: true }} />
    </ListItem>
  );
}
function EditItemLabel({ onClick, ...props }) {
  logger.log('EditItemLabel', 'props:', props);

  return (
    <ListItem
      sx={{ pl: 2, pr: 1, height: '55px', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}
      secondaryAction={(
        <ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={onClick}>
          <ExpandLess />
        </ListItemIcon>
      )}>
      <EditProperty {...props} controllerName={`${props.keyPrefix}.label`} label="Label" inputProps={{ variant: "standard" }} />
    </ListItem>
  );
}
function DeleteItemButton({ onClick, ...props }) {

  const searchName = props.referenceValueKey ?? props.keyPrefix;
  const deleteContextKey = searchName.split('.')[0];

  const nestedValues = props.itemsMethods.getNestedData(searchName);
  logger.log('DeleteItemButton', 'searchName:', searchName, 'nestedValues:', nestedValues, 'props:', props);

  const handleDeleteClicked = () => {
    logger.log('DeleteItemButton', 'handleDeleteClicked', 'deleteContextKey:', deleteContextKey, 'nestedValues:', nestedValues);
    props.itemsMethods.deleteItems(deleteContextKey, nestedValues);
  };

  return (
    <>
      <IconButton sx={{ mt: -0.5, mr: 0.5 }} onClick={handleDeleteClicked}>
        <DeleteOutlinedIcon />
      </IconButton>
    </>
  );
}
export function EditProperty({ controllerName, label, ...props }) {
  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledTextField {...nextProps} label={label} />;
        }} />
    </FieldWrapper>
  );
}
export function EditCollectionExternalSource({ ...props }) {

  logger.log('EditCollectionExternalSource', 'props:', props);

  return (
    <>
      <FieldWrapper>
        <FieldItem
          {...props}
          name={`${props.keyPrefix}.source`}
          render={(nextProps) => {
            return <ControlledAutocompleteField {...nextProps} label={'Source'} menuItems={collectionSources} defaultValue={collectionSources[0]?.value} />;
          }} />
      </FieldWrapper>
    </>
  );
}
export function EditCollectionTypeProperty({ controllerName, label, ...props }) {

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={collectionTypes} defaultValue={collectionTypes[0]?.value} />;
        }} />
    </FieldWrapper>
  );
}
export function EditReferencedCollectionProperty({ ...props }) {

  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const referencedCollections = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'collections' });

  const collections = useSubscription({ ...props, itemKey: 'collections', keyPrefix: undefined });

  logger.log('EditReferencedCollectionProperty', 'referencedCollections:', referencedCollections, 'collections:', collections, 'props:', props);

  if (referencedCollections === undefined || collections === undefined) {
    return null;
  }

  const collectionIds = [];
  referencedCollections.forEach((_, key) => {
    collectionIds.push(key);
  });

  if (collectionIds.length === 0) {
    return null;
  }

  const options = [];
  collections.forEach((values, collection) => {
    let label = values.get('label');
    if (label === undefined || label === "") {
      label = values.get('name');
    }
    options.push({ value: collection, label });
  });

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={`${props.keyPrefix}.collections.${collectionIds[0]}.id`}
        render={(nextProps) => {
          return (
            <ControlledAutocompleteField
              {...nextProps}
              label={'Collection'}
              menuItems={options}
              defaultValue={null} />
          );
        }} />
    </FieldWrapper>
  );
}
export function EditCollectionSortOrderProperty({ controllerName, label, ...props }) {

  const [nestedFields, setNestedFields] = useState(new Map());
  const [forcedState, updateState] = useState();
  const forceUpdate = useCallback((valueKey, value) => {
    logger.log('EditCollectionSortOrderProperty forceUpdate', 'valueKey:', valueKey, 'value:', value);
    updateState({});
  }, []);
  const [, updateColumnsState] = useState();
  const forceUpdateColumns = useCallback((valueKey, value) => {
    logger.log('EditCollectionSortOrderProperty forceUpdateColumns', 'valueKey:', valueKey, 'value:', value);
    updateColumnsState({});
  }, []);

  useEffect(() => {
    const { nestedFields: collectionNestedFields, subscriptions } = getNestedFields(props, forceUpdate, forceUpdateColumns, getSortOrderOptions);

    setNestedFields(collectionNestedFields);

    logger.log('EditCollectionSortOrderProperty', 'collectionNestedFields:', collectionNestedFields, 'subscriptions:', subscriptions, 'props:', props);

    return () => {
      logger.log('EditCollectionSortOrderProperty useEffect cleanup', 'keyPrefix:', props.keyPrefix, 'subscriptions:', subscriptions, 'props:', props);
      subscriptions.forEach((callback, key) => {
        props.itemsMethods.unsubscribeMap(key, callback);
      });
    };
  }, [props.keyPrefix, forcedState, setNestedFields]);


  let options = [{ value: 'id', label: 'Id' }];
  nestedFields.forEach(nestedField => {
    const columnValues = nestedField();
    if (columnValues !== undefined) {
      options.push(columnValues);
    }
  });

  logger.log('EditCollectionSortOrderProperty', 'options:', options, 'nestedFields:', nestedFields);

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={options} defaultValue={options[0]?.value} />;
        }} />
    </FieldWrapper>
  );
}
function getSortOrderOptions(props, referencedFieldId) {

  return function () {
    const referencedViewField = props.itemsMethods.getTreeMapItem(`fields.${referencedFieldId}`);
    if (referencedViewField === undefined) {
      return;
    }

    const fieldName = referencedViewField.get('name');
    const fieldLabel = referencedViewField.get('label') ?? fieldName;

    return { value: referencedFieldId, label: fieldLabel };
  };
}
export function EditCollectionXAxisProperty({ controllerName, label, ...props }) {

  const [nestedFields, setNestedFields] = useState(new Map());
  const [forcedState, updateState] = useState();
  const forceUpdate = useCallback((valueKey, value) => {
    logger.log('EditCollectionXAsixProperty forceUpdate', 'valueKey:', valueKey, 'value:', value);
    updateState({});
  }, []);
  const [, updateColumnsState] = useState();
  const forceUpdateColumns = useCallback((valueKey, value) => {
    logger.log('EditCollectionXAsixProperty forceUpdateColumns', 'valueKey:', valueKey, 'value:', value);
    updateColumnsState({});
  }, []);

  useEffect(() => {
    const { nestedFields: collectionNestedFields, subscriptions } = getNestedFields(props, forceUpdate, forceUpdateColumns, getSortOrderOptions);

    setNestedFields(collectionNestedFields);

    logger.log('EditCollectionXAsixProperty', 'collectionNestedFields:', collectionNestedFields, 'subscriptions:', subscriptions, 'props:', props);

    return () => {
      logger.log('EditCollectionXAsixProperty useEffect cleanup', 'keyPrefix:', props.keyPrefix, 'subscriptions:', subscriptions, 'props:', props);
      subscriptions.forEach((callback, key) => {
        props.itemsMethods.unsubscribeMap(key, callback);
      });
    };
  }, [props.keyPrefix, forcedState, setNestedFields]);


  let options = [{ value: 'id', label: 'Id' }];
  nestedFields.forEach(nestedField => {
    const columnValues = nestedField();
    if (columnValues !== undefined) {
      options.push(columnValues);
    }
  });

  logger.log('EditCollectionXAsixProperty', 'options:', options, 'nestedFields:', nestedFields);

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={options} defaultValue={options[0]?.value} />;
        }} />
    </FieldWrapper>
  );
}
export function EditFieldTypeProperty({ controllerName, label, ...props }) {

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={fieldTypes} />;
        }} />
    </FieldWrapper>
  );
}
export function EditAutocompleteFieldOptionsProperty(props) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const typeField = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' });

  // logger.log('EditAutocompleteFieldOptionsProperty', 'typeField:', typeField, 'props:', props)
  if (typeField === undefined || typeField === '0') {
    return null;
  }

  if (typeField === '1') {
    return (
      <>
        <EditFieldOptionsTypeProperty {...props} />
        <EditFieldOptionsProperty {...props} />
        <EditFieldOptionsLabelProperty {...props} />
      </>
    );
  }

  return null;
}
function EditFieldOptionsTypeProperty(props) {
  const label = 'Options Type';
  const controllerName = `${props.keyPrefix}.options-type`;

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={fieldOptionsTypes} defaultValue={fieldOptionsTypes[0].value} />;
        }} />
    </FieldWrapper>
  );
}
function EditFieldOptionsProperty(props) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const optionsTypeField = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'options-type' });

  // logger.log('EditFieldOptionsProperty', 'optionsTypeField:', optionsTypeField, 'props:', props)
  if (optionsTypeField === undefined) {
    return null;
  }

  if (optionsTypeField === '0') {
    return (
      <>
        <EditFieldOptionsCollectionProperty {...props} />
      </>
    );
  }

  return null;
}
function EditFieldOptionsCollectionProperty(props) {

  const collections = useSubscription({ ...props, itemKey: 'collections', keyPrefix: undefined });

  if (collections === undefined) {
    return null;
  }

  const options = [];
  collections.forEach((values, collection) => {
    let label = values.get('label');
    if (label === undefined || label === "") {
      label = values.get('name');
    }
    options.push({ value: collection, label });
  });

  const label = 'Options Collection';
  const controllerName = `${props.keyPrefix}.options-collection`;

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={options} defaultValue={null} />;
        }} />
    </FieldWrapper>
  );
}
function EditFieldOptionsLabelProperty(props) {

  const collections = useSubscription({ ...props, itemKey: 'fields', keyPrefix: undefined });

  if (collections === undefined) {
    return null;
  }

  const options = [];
  collections.forEach((values, collection) => {
    let label = values.get('label');
    if (label === undefined || label === "") {
      label = values.get('name');
    }
    options.push({ value: collection, label });
  });

  const label = 'Field for Label';
  const controllerName = `${props.keyPrefix}.options-label`;

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={options} defaultValue={null} />;
        }} />
    </FieldWrapper>
  );
}
