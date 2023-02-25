'use client';
import { Fragment, useState } from "react";
import { unflatten } from "flat";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Unstable_Grid2';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';
import TextField from "@mui/material/TextField";
import logger from "../../../../grow.api/src/logger";
import { FieldWrapper, FieldItem, ChildrenWithProps, ControlledTextField, ControlledAutocompleteField } from "./FieldItem";
import { collectionTypes, itemTypes, fieldTypes } from "./constants";
import { useSubscription } from "./useSubscription";

export function EditItems({ searchSuffix, ...props }) {

  const { name, fields } = useSubscription({ searchSuffix, ...props });

  logger.log('EditItems', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'fields:', fields, 'props:', props);

  if (Object.keys(fields).length === 0) {
    return (
      <>
        <AddItemActions {...props} fields={fields}>
          <AddExistingItemControl />
          <AddNewItemControl />
        </AddItemActions>
      </>
    );
  }

  return (
    <EditControls {...props} name={name} fields={fields} />
  );
}
function EditControls({ name, fields, ...props }) {
  logger.log('EditControls', 'name:', name, 'contextKey:', props.contextKey, 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props);

  const contextKey = props.contextKey;
  const itemKey = props.itemKey;

  let EditControl = null;
  switch (itemKey) {
    case 'pages':
      EditControl = EditPage;
      break;
    case 'sections':
      EditControl = EditSection;
      break;
    case 'groups':
      EditControl = EditGroup;
      break;
    case 'views':
      EditControl = EditView;
      break;
    case 'fields':
      EditControl = EditField;
      break;
  }

  return (
    <>
      {Object.keys(fields).map((fieldKey, index) => {

        const keyPrefix = `${name}.${fieldKey}`;
        const valueKeys = fields[fieldKey];

        logger.log('EditControls rendering', 'fieldKey:', fieldKey, 'keyPrefix:', keyPrefix, 'valueKeys:', valueKeys);

        if (EditControl === null) {
          return null;
          // use below to debug missing properties
          // return (
          //   <div key={fieldKey}>
          //     {props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(valueKeys, null, 2)} />
          //   </div>
          // )
        }

        return (
          <Fragment key={fieldKey}>
            <EditControl {...props} keyPrefix={keyPrefix} fieldKey={fieldKey} valueKeys={valueKeys} />
            <Divider />
          </Fragment>
        );
      })}

      {['pages', 'groups'].includes(itemKey) && (
        <AddItemActions {...props} fields={fields}>
          <AddNewItemControl />
        </AddItemActions>
      )}

      {['sections'].includes(itemKey) && (
        <AddItemActions {...props} fields={fields}>
          <AddNewItemControl />
          <AddCollectionItemControl />
        </AddItemActions>
      )}

      {['views', 'fields'].includes(itemKey) && (name !== itemKey) && (
        <AddItemActions {...props} fields={fields}>
          <AddExistingItemControl />
          <AddNewItemControl />
        </AddItemActions>
      )}
    </>
  );
}
function AddItemActions({ children, ...props }) {

  const [addingItem, setAddingItem] = useState(false);

  const handleSetAddingItem = (newAddingItem) => {
    setAddingItem(newAddingItem);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <ChildrenWithProps {...props} addingItem={addingItem} setAddingItem={handleSetAddingItem}>
        {children}
      </ChildrenWithProps>
    </Box>
  );
}
function AddNewItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddNewItemControl', 'props:', props);

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddNewItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties);

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey;

    const valueKey = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey;

    let propertiesToAdd;

    if (props.itemKey === 'pages') {
      propertiesToAdd = {
        ...addedProperties,
        sections: { label: 'Section 1', name: 'section_1', width: '12' }
      };
    }
    else if (props.itemKey === 'sections') {
      propertiesToAdd = {
        ...addedProperties,
        width: '12'
      };
    }
    else if (props.itemKey === 'views') {
      propertiesToAdd = {
        id: {
          ...addedProperties,
          groups: { label: 'Group 1', name: 'group_1', width: '12' }
        }
      };
    }
    else if (props.itemKey === 'groups') {
      propertiesToAdd = {
        ...addedProperties,
        width: '12'
      };
    }
    else if (props.itemKey === 'fields') {
      propertiesToAdd = {
        id: {
          ...addedProperties
        }
      };
    }

    const itemsToAdd = {
      [valueKey]: propertiesToAdd
    };

    props.addItems(itemKey, itemsToAdd);

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddNewItemControl handleAddItemCancelClick');
    setAddingItem(false);
  };

  return (
    <>
      {!addingItem && (
        <Box sx={{ py: 2, px: 2 }}>
          <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem('new')}>
            Add New {props.itemKey.substring(0, props.itemKey.length - 1)}
          </Button>
        </Box>
      )}
      {addingItem === 'new' && (
        <Box sx={{ py: 2, px: 2, width: '100%' }}>
          <AddNewItemProperties
            {...props}
            addingItem={addingItem}
            onAddItemConfirmClick={handleAddItemConfirmClick}
            onAddItemCancelClick={handleAddItemCancelClick} />
        </Box>
      )}
    </>
  );
}
function AddNewItemProperties(props) {

  const itemFields = unflatten(props.getNestedData(props.itemKey))
  logger.log('AddNewItemControl AddNewItemProperties', 'itemFields', itemFields.fields)

  const [itemLabel, setItemLabel] = useState(getNextItemLabel(props.itemKey, itemFields.fields ?? props.fields));
  const [itemName, setItemName] = useState(getNextItemName(itemLabel));
  const [nameChanged, setNameChanged] = useState(false)

  const handleLabelChanged = (event) => {
    setItemLabel(event.target.value)

    if (!nameChanged) {
      setItemName(getNextItemName(event.target.value))
    }
  }

  const handleNameChanged = (event) => {
    setItemName(event.target.value)
    setNameChanged(true)
  }

  return (
    <>
      <FieldWrapper>
        <TextField
          label="Label"
          fullWidth
          size="small"
          value={itemLabel}
          onChange={handleLabelChanged} />
      </FieldWrapper>
      <FieldWrapper>
        <TextField
          label="Name"
          fullWidth
          size="small"
          value={itemName}
          onChange={handleNameChanged} />
      </FieldWrapper>
      <Button
        color="secondary"
        size="small"
        sx={{ mt: 1 }}
        disabled={itemName === ""}
        onClick={() => props.onAddItemConfirmClick({ label: itemLabel, name: itemName })}>
        Confirm
      </Button>
      <Button
        size="small"
        sx={{ mt: 1 }}
        onClick={props.onAddItemCancelClick}>
        Cancel
      </Button>
    </>
  );
}

function getNextItemLabel(itemKey, fields) {
  const existingNames = fields !== undefined
    ? Object.keys(fields).map(field => fields[field]?.name ?? "")
    : [];
  // logger.log('AddNewItemControl', 'fields:', fields, 'existingNames:', existingNames)

  let nextItemIndex = existingNames.length + 1;
  let nextItemName = `${itemKey.substring(0, itemKey.length - 1)} ${nextItemIndex}`;
  while (existingNames.includes(nextItemName)) {
    nextItemIndex++;
    nextItemName = `${itemKey}${nextItemIndex}`;
  }

  return nextItemName.charAt(0).toUpperCase() + nextItemName.substring(1);
}

function getNextItemName(label) {
  return label.split(' ').join('_').toLowerCase();
}

function AddExistingItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddExistingItemControl', 'props:', props);

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddExistingItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties);

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey;

    const keyPrefix = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey;

    const itemsToAdd = {
      [keyPrefix]: addedProperties
    };

    props.addItems(itemKey, itemsToAdd);

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddExistingItemControl handleAddItemCancelClick');
    setAddingItem(false);
  };

  return (
    <>
      {!addingItem && (
        <Box sx={{ py: 2, px: 2 }}>
          <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem('existing')}>
            Add {props.itemKey.substring(0, props.itemKey.length - 1)}
          </Button>
        </Box>
      )}
      {addingItem === 'existing' && (
        <Box sx={{ py: 2, px: 2, width: '100%' }}>
          <AddExistingItemProperties
            {...props}
            addingItem={addingItem}
            onAddItemConfirmClick={handleAddItemConfirmClick}
            onAddItemCancelClick={handleAddItemCancelClick} />
        </Box>
      )}
    </>
  );
}
function AddExistingItemProperties(props) {

  const [itemValue, setItemValue] = useState({ value: null, label: "" });
  const { fields: currentItems } = useSubscription({ ...props, itemKey: props.itemKey, keyPrefix: props.keyPrefix });
  const { fields: existingItems } = useSubscription({ ...props, itemKey: props.itemKey, keyPrefix: undefined });
  logger.log('AddExistingItemProperties', 'props:', props, 'currentItems:', currentItems, 'existingItems:', existingItems);

  const handleItemValueChange = (_, newValue) => {
    // logger.log('AddExistingItemControl handleItemValueChange', newValue)
    if (newValue === null) {
      setItemValue({ value: null, label: "" });
    }
    else {
      setItemValue(newValue);
    }
  };

  const handleItemTextChange = (event) => {
    setItemValue({ ...itemValue, label: event.target.value ?? "" });
  };

  const handleAddItemConfirmClick = () => {
    logger.log('AddExistingItemProperties handleAddItemConfirmClick', 'itemKey:', props.itemKey, 'itemValue:', itemValue);
    props.onAddItemConfirmClick && props.onAddItemConfirmClick(
      { id: itemValue.value }
    );
    setItemValue({ value: null, label: "" });
  };

  const options = Object.keys(existingItems).map(existingItemKey => {
    return { value: existingItemKey, label: existingItems[existingItemKey].label ?? existingItems[existingItemKey].name };
  });

  return (
    <>
      <FieldWrapper>
        <Autocomplete
          label={props.itemKey}
          autoComplete
          autoSelect
          autoHighlight
          fullWidth
          size="small"
          options={options}
          value={itemValue.value}
          inputValue={itemValue.label}
          onChange={handleItemValueChange}
          isOptionEqualToValue={(option, testValue) => option?.value === testValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.type}
              onChange={handleItemTextChange} />
          )} />
      </FieldWrapper>
      <Button
        color="secondary"
        size="small"
        sx={{ mt: 1 }}
        disabled={itemValue.value === null}
        onClick={handleAddItemConfirmClick}>
        Confirm
      </Button>
      <Button
        size="small"
        sx={{ mt: 1 }}
        onClick={props.onAddItemCancelClick}>
        Cancel
      </Button>
    </>
  );
}
function AddCollectionItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddCollectionItemControl', 'props:', props);

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddCollectionItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties);

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey;

    const keyPrefix = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey;


    let propertiesToAdd;

    propertiesToAdd = {
      ...addedProperties,
      width: '12',
      collections: {
        id: {
          name: addedProperties.name,
          label: addedProperties.label
        }
      }
    };

    const itemsToAdd = {
      [keyPrefix]: propertiesToAdd
    };

    logger.log('AddCollectionItemControl props.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')');
    props.addItems(itemKey, itemsToAdd);

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddCollectionItemControl handleAddItemCancelClick');
    setAddingItem(false);
  };

  return (
    <>
      {!addingItem && (
        <Box sx={{ py: 2, px: 2 }}>
          <Button variant="outlined" color="secondary" size="small" onClick={() => setAddingItem('collection')}>
            Add Collection
          </Button>
        </Box>
      )}
      {addingItem === 'collection' && (
        <Box sx={{ py: 2, px: 2, width: '100%' }}>
          <AddCollectionItemProperties
            {...props}
            addingItem={addingItem}
            onAddItemConfirmClick={handleAddItemConfirmClick}
            onAddItemCancelClick={handleAddItemCancelClick} />
        </Box>
      )}
    </>
  );
}
function AddCollectionItemProperties(props) {

  const [itemName, setItemName] = useState(getNextItemName('collections', props.fields));
  const [itemLabel, setItemLabel] = useState(getNextItemLabel('collections', props.fields));
  const [itemValue, setItemValue] = useState({ value: null, label: "" });
  logger.log('AddCollectionItemProperties', 'props:', props);

  const handleItemValueChange = (_, newValue) => {
    // logger.log('AddExistingItemControl handleItemValueChange', newValue)
    if (newValue === null) {
      setItemValue({ value: null, label: "" });
    }
    else {
      setItemValue(newValue);
    }
  };

  const handleItemTextChange = (event) => {
    setItemValue({ ...itemValue, label: event.target.value ?? "" });
  };

  const handleAddItemConfirmClick = () => {
    logger.log('AddExistingItemProperties handleAddItemConfirmClick', 'itemKey:', props.itemKey, 'itemValue:', itemValue);
    props.onAddItemConfirmClick && props.onAddItemConfirmClick(
      { label: itemLabel, name: itemName, type: itemValue.value, width: '12' }
    );
    setItemValue({ value: null, label: "" });
  };

  const options = collectionTypes;

  return (
    <>
      <FieldWrapper>
        <TextField
          label="Label"
          fullWidth
          size="small"
          value={itemLabel}
          onChange={(event) => setItemLabel(event.target.value)} />
      </FieldWrapper>
      <FieldWrapper>
        <TextField
          label="Name"
          fullWidth
          size="small"
          value={itemName}
          onChange={(event) => setItemName(event.target.value)} />
      </FieldWrapper>
      <FieldWrapper>
        <Autocomplete
          label={props.itemKey}
          autoComplete
          autoSelect
          autoHighlight
          fullWidth
          size="small"
          options={options}
          value={itemValue.value}
          inputValue={itemValue.label}
          onChange={handleItemValueChange}
          isOptionEqualToValue={(option, testValue) => option?.value === testValue}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.type}
              onChange={handleItemTextChange} />
          )} />
      </FieldWrapper>
      <Button
        color="secondary"
        size="small"
        sx={{ mt: 1 }}
        disabled={itemValue.value === null}
        onClick={handleAddItemConfirmClick}>
        Confirm
      </Button>
      <Button
        size="small"
        sx={{ mt: 1 }}
        onClick={props.onAddItemCancelClick}>
        Cancel
      </Button>
    </>
  );
}
function EditPage(props) {
  logger.log('EditPage', 'props:', props);
  return (
    <>
      <EditItem {...props} contextKey="pages" />
    </>
  );
}
function EditSection(props) {
  logger.log('EditSection', 'props:', props);
  return (
    <EditItem {...props} contextKey="pages">
      <EditProperty controllerName={`${props.keyPrefix}.width`} label="Width" />
      {props.valueKeys.hasOwnProperty('type') && (
        <EditCollectionTypeProperty controllerName={`${props.keyPrefix}.type`} label="Type" />
      )}
    </EditItem>
  );
}
function EditView(props) {
  logger.log('EditView', 'props:', props);
  return (
    <EditItem {...props} contextKey="views" />
  );
}
function EditGroup(props) {
  logger.log('EditGroup', 'props:', props);
  return (
    <EditItem {...props} contextKey="views">
      <EditProperty controllerName={`${props.keyPrefix}.width`} label="Width" />
    </EditItem>
  );
}
function EditField(props) {
  logger.log('EditField', 'props:', props);
  return (
    <EditItem {...props} contextKey="fields">
      <EditFieldTypeProperty controllerName={`${props.keyPrefix}.type`} label="Type" />
    </EditItem>
  );
}
function EditItem({ children, fieldKey, ...props }) {
  logger.log('EditItem', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'fieldKey:', fieldKey, 'valueKeys:', props.valueKeys, 'props:', props);

  const missingNestedItems = getMissingNestedItems(props);
  const valueKeys = {
    ...props.valueKeys,
    ...missingNestedItems
  };

  return (
    <>
      <EditReferencedItem {...props} valueKeys={valueKeys} />

      <EditItemProperties {...props} valueKeys={valueKeys} fieldKey={fieldKey}>
        {children}
        <EditNestedItems {...props} valueKeys={valueKeys} />
      </EditItemProperties>

    </>
  );
}
function getMissingNestedItems({ itemKey, valueKeys }) {
  switch (itemKey) {
    case 'sections':
      if (!valueKeys.hasOwnProperty('views')) {
        return { ...valueKeys, views: {} };
      }
      break;
    case 'groups':
      if (!valueKeys.hasOwnProperty('fields')) {
        return { ...valueKeys, fields: {} };
      }
      break;
    default:
      break;
  }

  return {};
}
function EditReferencedItem({ valueKeys, ...props }) {
  logger.log('EditReferencedItem', 'valueKeys:', valueKeys, 'props:', props);

  if (valueKeys !== null && valueKeys?.id !== undefined) {
    return (
      <>
        <EditItems {...props} keyPrefix={undefined} searchSuffix={valueKeys.id} />
      </>
    );
  }
  return null;
}
function EditItemProperties({ valueKeys, fieldKey, children, ...props }) {
  logger.log('EditItemProperties', 'valueKeys:', valueKeys, 'fieldKey:', fieldKey, 'props:', props);

  const [openFields, setOpenFields] = useState([]);

  if (valueKeys !== null && valueKeys?.id !== undefined) {
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
          <EditItemHeader {...props} onClick={handleClick} />
        </Collapse>

        {isOpen && (<>
          <EditItemLabel {...props} onClick={handleClick} />

          <Stack spacing={0} sx={{ px: 2, py: 2 }}>
            <EditProperty {...props} controllerName={`${props.keyPrefix}.name`} label="Name" />

            <ChildrenWithProps {...props} openFields={openFields}>
              {children}
            </ChildrenWithProps>
          </Stack>
        </>)}

      </Box>
    </Grid>
  );
}
function EditItemHeader({ onClick, ...props }) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const { fields: nameFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'name' });
  const { fields: labelFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'label' });

  logger.log('EditItemHeader', 'nameFields:', nameFields, 'labelFields:', labelFields, 'props:', props);

  if (labelFields?.label === undefined || nameFields?.name === undefined) {
    return null;
  }

  let primary = labelFields.label ?? nameFields.name;
  let secondary;
  if (primary === labelFields.label) {
    secondary = nameFields.name;
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
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const { fields: labelFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'label' });

  logger.log('EditItemLabel', 'labelFields:', labelFields, 'props:', props);

  if (labelFields?.label === undefined) {
    return null;
  }

  return (
    <ListItem
      sx={{ px: 2, height: '55px', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}
      secondaryAction={(
        <ListItemIcon sx={{ justifyContent: 'flex-end' }} onClick={onClick}>
          <ExpandLess />
        </ListItemIcon>
      )}>
      <EditProperty {...props} controllerName={`${props.keyPrefix}.label`} label="Label" inputProps={{ variant: "standard" }} />
    </ListItem>
  );
}
function EditNestedItems({ valueKeys, keyPrefix, ...props }) {
  logger.log('EditNestedItems', 'valueKeys:', valueKeys, 'keyPrefix:', keyPrefix, 'props:', props);
  return (
    <>
      {valueKeys !== null && Object.keys(valueKeys).map(itemKey => {
        if (itemTypes.includes(itemKey) === false) {
          return null;
        }

        return (
          <Box key={itemKey} sx={{ mt: 1, flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
            <EditItems {...props} keyPrefix={keyPrefix} itemKey={itemKey} />
          </Box>
        );
      })}

      {/* {!valueKeys.hasOwnProperty('sections') && (
              <AddNewItemControl {...props} />
            )} */}
    </>
  );
}
function EditProperty({ controllerName, label, ...props }) {
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
function EditCollectionTypeProperty({ controllerName, label, ...props }) {

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
function EditFieldTypeProperty({ controllerName, label, ...props }) {

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
