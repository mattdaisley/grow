'use client';

import { Children, cloneElement, Fragment, isValidElement, useRef, useState, useEffect, useMemo, useCallback } from "react";
import { FormProvider, Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { unflatten } from 'flat';

import AddIcon from '@mui/icons-material/Add';
import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import logger from "../../../../grow.api/src/logger";
import { useItems } from "./useItems";

const itemTypes = ['pages', 'sections', 'views', 'groups', 'fields'];
const fieldTypes = [{ value: '0', label: 'textfield' }, { value: '1', label: 'autocomplete' }]
const collectionTypes = [{ value: '0', label: 'collection-tabs' }, { value: '1', label: 'collection-grid' }]

export default function TestingNestingPage() {

  const itemKeys = ['preview', 'pages', 'views', 'fields']

  const items = useItems(itemKeys);

  logger.log('TestingNestingPage', items)

  if (items.itemKeys.length === 0) {
    return null;
  }

  return (
    <Grid xs={12} container sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1, py: 4, pl: { xs: 2, md: 4 } }}>
        <Grid container xs={12} spacing={0}>
          <Grid xs={8}>
            <Grid container spacing={4} xs={12} sx={{ width: '100%' }}>
              <ShowItems contextKey={'preview'} contextValueKeyPrefix={'preview'} itemKey={'pages'} {...items} />
            </Grid>
          </Grid>
          <Grid xs={4}>
            <Grid container spacing={0} xs={12} sx={{ width: '100%' }}>
              <Box sx={{ flexGrow: 1, pr: { xs: 2, md: 4 }, mt: -.5 }}>
                <Paper sx={{ width: '100%' }}>
                  <EditItems itemKey={'pages'} {...items} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  )
}



function useSubscription(props) {

  const [fields, setFields] = useState({})
  const _fieldsRef = useRef({})

  let name = props.keyPrefix === undefined ? props.itemKey : `${props.keyPrefix}.${props.itemKey}`
  let searchName = props.searchSuffix === undefined ? name : `${name}.${props.searchSuffix}`

  logger.log('useSubscription', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'searchSuffix:', props.searchSuffix, 'name:', name, 'searchName:', searchName, 'props:', props)

  useEffect(() => {

    const callback = (valueKey, value) => {
      logger.log('useSubscription subscribed change', searchName, valueKey, value)
      const trimmedKey = valueKey.substring(name.length + 1, valueKey.length)
      updateFields(_fieldsRef, { ..._fieldsRef.current, [trimmedKey]: value }, setFields)
    }

    props.subscribe(searchName, callback)

    const nestedData = props.getNestedData(searchName)
    const newFields = {}
    Object.keys(nestedData).map(nestedDataKey => {
      const trimmedKey = nestedDataKey.substring(name.length + 1, nestedDataKey.length)
      newFields[trimmedKey] = nestedData[nestedDataKey]
    })

    updateFields(_fieldsRef, newFields, setFields)
    logger.log('useSubscription useEffect', 'name:', name, 'newFields:', newFields, 'nestedData:', nestedData)

    return () => {
      props.unsubscribe(searchName, callback)
    }
  }, [name, searchName])

  return {
    name,
    fields
  };
}

function updateFields(_ref, newFields, setFunc) {
  if (_ref?.current !== undefined) {
    _ref.current = newFields
    setFunc(unflatten(_ref.current, { object: true }))
  }
}




function ShowItems({ searchSuffix, ...props }) {

  const { name, fields } = useSubscription({ searchSuffix, ...props })

  logger.log('ShowItems', 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props)

  if (Object.keys(fields).length === 0) {
    return null;
  }

  return (
    <ShowControls {...props} name={name} fields={fields} />
  )
}

function ShowControls({ name, fields, ...props }) {
  logger.log('ShowControls', 'name:', name, 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props)

  function getShowControl(itemKey) {
    switch (itemKey) {
      case 'pages':
        return ShowPage
      case 'sections':
        return ShowSection
      case 'groups':
        return ShowGroup
      case 'views':
        return ShowView
      case 'fields':
        return ShowField
      default:
        return null;
    }
  }

  return (
    <>
      {Object.keys(fields).map(fieldKey => {

        const keyPrefix = `${name}.${fieldKey}`
        const valueKeys = fields[fieldKey]

        logger.log('ShowControls rendering', 'fieldKey:', fieldKey, 'valueKeys:', valueKeys)

        const ShowControl = getShowControl(props.itemKey)

        if (ShowControl === null) {
          return null;
          // use below to debug missing properties
          // return (
          //   <div key={fieldKey}>
          //     {props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(valueKeys, null, 2)} />
          //   </div>
          // )
        }

        return <ShowControl key={fieldKey} {...props} keyPrefix={keyPrefix} fieldKey={fieldKey} valueKeys={valueKeys} />
      })}
    </>
  )
}


function ShowPage(props) {

  logger.log('ShowPage', 'props:', props)

  return (
    <>
      <ShowItemLabel {...props} />
      <ShowItem {...props} />
    </>
  )
}

function ShowSection(props) {
  const itemKey = `${props.keyPrefix}`
  const keyPrefix = undefined
  const { fields: widthFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'width' })
  const { fields: typeFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' })

  logger.log('ShowSection', 'typeField:', typeFields, 'widthFields:', widthFields, 'props:', props)

  const width = Number(widthFields.width) || 12

  return (
    <Grid xs={width} alignContent={'flex-start'}>
      <Paper sx={{ width: '100%' }}>
        {(typeFields?.type === undefined) && (
          <Grid container spacing={1} xs={12} sx={{ py: 1, px: 2 }}>
            <ShowItem {...props} />
          </Grid>
        )}
        {(typeFields.type !== undefined) && (
          <ShowCollection {...props} />
        )}
      </Paper>
    </Grid>
  )
}

function ShowCollection({ ...props }) {
  logger.log('ShowCollectionTabs', 'props:', props)

  // const collectionIds = props.valueKeys.collections?.map(collection => collection.id)

  if (!props.valueKeys.hasOwnProperty('collections')) {
    return null;
  }

  const collectionIds = Object.keys(props.valueKeys.collections).map(key => props.valueKeys.collections[key].id)

  if (collectionIds.length === 0) {
    return null;
  }

  return (
    <>
      {props.valueKeys.type === '0' && (
        <ShowCollectionTabs
          pageProps={{ ...props }}
          collectionProps={{
            contextKey: `${props.contextKey}_collections_${collectionIds[0]}`,
            itemKey: 'collections',
            fieldKey: collectionIds[0],
            keyPrefix: `collections.${collectionIds[0]}`
          }}
        />
      )}
    </>
  )

}

function ShowCollectionTabs({ pageProps, collectionProps }) {

  logger.log('ShowCollectionTabs', 'pageProps:', pageProps, 'collectionProps:', collectionProps)

  useEffect(() => {
    pageProps.getItems([collectionProps.contextKey, 'collections'])
  })

  return (
    <CollectionTabs pageProps={pageProps} collectionProps={{ ...collectionProps }} />
  )
}

function CollectionTabs({ pageProps, collectionProps }) {

  const keyPrefix = undefined
  const { name, fields } = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined })
  const { fields: collectionLabelFields } = useSubscription({ ...pageProps, itemKey: `${collectionProps.itemKey}.${collectionProps.fieldKey}`, keyPrefix, searchSuffix: 'label' })

  logger.log('CollectionTabs', 'name:', name, 'fields:', fields, 'collectionLabelFields:', collectionLabelFields, 'pageProps:', pageProps, 'collectionProps:', collectionProps)


  const handleCollectionAdd = () => {
    logger.log('CollectionTabs handleCollectionAdd')

    const itemKey = collectionProps.contextKey
    const keyPrefix = collectionProps.contextKey

    let propertiesToAdd = {
      type: pageProps.valueKeys.type
    }

    const itemsToAdd = {
      [keyPrefix]: propertiesToAdd
    }

    logger.log('CollectionTabs collectionProps.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')')
    pageProps.addItems(itemKey, itemsToAdd)
  }

  return (
    <>
      <ControlledTabs
        fields={fields}
        collectionLabelFields={collectionLabelFields}
        onCollectionAdd={handleCollectionAdd}
        pageProps={pageProps}
        collectionProps={collectionProps}
      />
    </>
  )
}

function ControlledTabs({ pageProps, collectionProps, ...props }) {

  const [tabState, setTabState] = useState({ currentTab: 0, tabToRemove: undefined });

  const handleTabChange = (event, newValue) => {
    setTabState({ ...tabState, currentTab: newValue });
  };

  const currentTab = (Object.keys(props.fields).length > tabState.currentTab) ? tabState.currentTab : Object.keys(props.fields).length - 1

  return (
    <>
      <Grid container spacing={0} alignItems={'center'} sx={{ p: 1 }}>
        <Box sx={{
          px: 1,
          // maxWidth: { xs: `calc(100% * 11 / var(--Grid-columns))` }
          maxWidth: { xs: `calc(100% - 45px)` }
        }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons={false}>
            {(Object.keys(props.fields))?.map((field, index) => {
              // console.log(field, group)
              let collectionName = props.collectionLabelFields?.label ?? "Collection"
              let label = `${collectionName} ${index + 1}`

              return (
                <Tab key={index} label={label} />
              )
            })}
          </Tabs>
        </Box>
        <Box xs={1}>
          {/* <IconButton onClick={handleCollectionRemove}><RemoveIcon /></IconButton> */}
          <IconButton onClick={props.onCollectionAdd}><AddIcon /></IconButton>
        </Box>
        <Grid container spacing={1} xs={12} sx={{ pt: 1 }}>
          {
            Object.keys(props.fields)?.map((field, index) => (
              <TabPanel
                key={field}
                currentTab={currentTab}
                index={index}
                {...pageProps}
                contextKey={collectionProps.contextKey}
                contextValueKeyPrefix={`${collectionProps.contextKey}.${field}`}
              // itemKey={`${field}`}
              // keyPrefix={`${collectionProps.contextKey}`}
              />
            ))
          }
        </Grid>
      </Grid>
    </>
  );
}

function TabPanel({ currentTab, index, ...props }) {
  // logger.log('TabPanel', 'currentTab:', currentTab, 'index:', index, 'props:', props)

  return <>
    {currentTab === index && (
      <Grid container spacing={1} xs={12} sx={{ py: 1, px: 2 }}>
        <ShowItem {...props} />
      </Grid>
    )}
  </>;
}

function ShowView(props) {
  logger.log('ShowView', 'props:', props)

  return (
    <>
      <ShowItemLabel {...props} />
      <ShowItem {...props} />
    </>
  )
}

function ShowGroup(props) {
  const itemKey = `${props.keyPrefix}`
  const keyPrefix = undefined
  const searchSuffix = 'width'
  const { name: widthName, fields: widthFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix })

  logger.log('ShowGroup', 'widthName:', widthName, 'widthFields:', widthFields, 'props:', props)

  return (
    <Grid xs={Number(widthFields?.width) ?? 12} sx={{ mt: 1 }}>
      <ShowItem {...props} />
    </Grid>
  )
}

function ShowField(props) {
  logger.log('ShowField', 'props:', props)

  return (
    <>
      {
        props.valueKeys.hasOwnProperty('type')
          ? <ShowFieldControl {...props} itemKey={`${props.itemKey}.${props.fieldKey}`} keyPrefix={undefined} searchSuffix={undefined} />
          : <ShowItem {...props} />
      }


    </>
  )
}

function ShowFieldControl(props) {
  const itemKey = `${props.itemKey}`
  const keyPrefix = undefined

  const { name: typeName, fields: typeFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' })
  const { name: nameName, fields: nameFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'name' })
  const { name: labelName, fields: labelFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: `label` })
  logger.log('ShowFieldControl', 'nameName:', nameName, 'nameFields:', nameFields, 'labelName:', labelName, 'labelFields:', labelFields, 'props:', props)

  if (Object.keys(typeFields).length === 0 || Object.keys(labelFields).length === 0) {
    return null;
  }

  const controllerName = `${props.contextValueKeyPrefix}.${nameFields.name}`
  const label = labelFields.label ?? nameFields.name

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledField {...nextProps} type={typeFields.type} label={label} />
        }}
      />
    </FieldWrapper>
  )
}

function ShowItem({ children, keyPrefix, fieldKey, valueKeys, ...props }) {
  logger.log('ShowItem', 'itemKey:', props.itemKey, 'keyPrefix:', keyPrefix, 'fieldKey:', fieldKey, 'valueKeys:', valueKeys, 'props:', props)

  return (
    <>
      <ShowReferencedItem {...props} valueKeys={valueKeys} />
      <ShowItemProperties {...props} valueKeys={valueKeys} fieldKey={fieldKey}>
        {children}
      </ShowItemProperties>

      <ShowNestedItems {...props} valueKeys={valueKeys} keyPrefix={keyPrefix} />
    </>
  )
}

function ShowItemLabel(props) {
  const itemKey = `${props.itemKey}.${props.fieldKey}`
  const keyPrefix = undefined
  const searchSuffix = 'label'
  const { fields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix })

  logger.log('ItemLabel', 'labelFields:', fields, 'props:', props)

  if (fields?.label === undefined || fields.label === "") {
    return null;
  }

  return (
    <Grid xs={12} sx={{ mb: -1 }}>
      <Typography variant="h5" sx={{ borderBottom: 1, borderColor: 'grey.300', px: 1 }}>{fields.label}</Typography>
    </Grid>
  )
}

function ShowReferencedItem({ valueKeys, ...props }) {
  logger.log('ShowReferencedItem', 'valueKeys:', valueKeys, 'props:', props)

  if (valueKeys !== null && valueKeys?.id !== undefined) {
    return <ShowItems {...props} keyPrefix={undefined} searchSuffix={valueKeys.id} />;
  }
  return null;
}

function ShowItemProperties({ valueKeys, fieldKey, children, ...props }) {
  logger.log('ShowItemProperties', 'valueKeys:', valueKeys, 'fieldKey:', fieldKey, 'props:', props)

  if (valueKeys !== null && valueKeys?.id === undefined) {
    return (
      <>
        <ChildrenWithProps {...props}>
          {children}
        </ChildrenWithProps>
      </>
    )
  }

  return null;
}

function ShowNestedItems({ valueKeys, keyPrefix, ...props }) {
  return (
    <>
      {valueKeys !== null && Object.keys(valueKeys).map(valueKey => {
        logger.log('ShowNestedItems nested', 'keyPrefix:', keyPrefix, 'valueKey:', valueKey)
        if (itemTypes.includes(valueKey) === false) {
          return null;
        }

        return (
          <ShowItems key={valueKey} {...props} keyPrefix={keyPrefix} itemKey={valueKey} />
        )
      })}
    </>
  )
}




function EditItems({ searchSuffix, ...props }) {

  const { name, fields } = useSubscription({ searchSuffix, ...props })

  logger.log('EditItems', 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props)

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
  )
}

function EditControls({ name, fields, ...props }) {
  logger.log('EditControls', 'name:', name, 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props)

  const itemKey = props.itemKey

  let EditControl = null
  switch (itemKey) {
    case 'pages':
      EditControl = EditPage
      break;
    case 'sections':
      EditControl = EditSection
      break;
    case 'groups':
      EditControl = EditGroup
      break;
    case 'views':
      EditControl = EditView
      break;
    case 'fields':
      EditControl = EditField
      break;
  }

  return (
    <>
      {Object.keys(fields).map((fieldKey, index) => {

        const keyPrefix = `${name}.${fieldKey}`
        const valueKeys = fields[fieldKey]

        logger.log('EditControls rendering', 'fieldKey:', fieldKey, 'valueKeys:', valueKeys)

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
        )
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
  )
}

function AddItemActions({ children, ...props }) {

  const [addingItem, setAddingItem] = useState(false);

  const handleSetAddingItem = (newAddingItem) => {
    setAddingItem(newAddingItem)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <ChildrenWithProps {...props} addingItem={addingItem} setAddingItem={handleSetAddingItem}>
        {children}
      </ChildrenWithProps>
    </Box>
  )
}

function AddNewItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddNewItemControl', 'props:', props)

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddNewItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties)

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey

    const valueKey = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey

    let propertiesToAdd;

    if (props.itemKey === 'pages') {
      propertiesToAdd = {
        ...addedProperties,
        sections: { label: 'Section 1', name: 'section_1', width: '12' }
      }
    }
    else if (props.itemKey === 'sections') {
      propertiesToAdd = {
        ...addedProperties,
        width: '12'
      }
    }
    else if (props.itemKey === 'views') {
      propertiesToAdd = {
        id: {
          ...addedProperties,
          groups: { label: 'Group 1', name: 'group_1', width: '12' }
        }
      }
    }
    else if (props.itemKey === 'groups') {
      propertiesToAdd = {
        ...addedProperties,
        width: '12'
      }
    }
    else if (props.itemKey === 'fields') {
      propertiesToAdd = {
        id: {
          ...addedProperties
        }
      }
    }

    const itemsToAdd = {
      [valueKey]: propertiesToAdd
    }

    props.addItems(itemKey, itemsToAdd)

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddNewItemControl handleAddItemCancelClick')
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
            onAddItemCancelClick={handleAddItemCancelClick}
          />
        </Box>
      )}
    </>
  );
}

function AddNewItemProperties(props) {

  const [itemName, setItemName] = useState(getNextItemName(props.itemKey, props.fields));
  const [itemLabel, setItemLabel] = useState(getNextItemLabel(props.itemKey, props.fields));

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
  )
}

function getNextItemName(itemKey, fields) {
  return getNextItemLabel(itemKey, fields).split(' ').join('_').toLowerCase();
}

function getNextItemLabel(itemKey, fields) {
  const existingNames = fields !== undefined
    ? Object.keys(fields).map(field => field?.name ?? "")
    : []

  let nextItemIndex = existingNames.length + 1
  let nextItemName = `${itemKey.substring(0, itemKey.length - 1)} ${nextItemIndex}`
  while (existingNames.includes(nextItemName)) {
    nextItemIndex++
    nextItemName = `${itemKey}${nextItemIndex}`
  }

  return nextItemName.charAt(0).toUpperCase() + nextItemName.substring(1);
}

function AddExistingItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddExistingItemControl', 'props:', props)

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddExistingItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties)

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey

    const keyPrefix = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey

    const itemsToAdd = {
      [keyPrefix]: addedProperties
    }

    props.addItems(itemKey, itemsToAdd)

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddExistingItemControl handleAddItemCancelClick')
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
            onAddItemCancelClick={handleAddItemCancelClick}
          />
        </Box>
      )}
    </>
  );
}

function AddExistingItemProperties(props) {

  const [itemValue, setItemValue] = useState({ value: null, label: "" });
  const { fields: currentItems } = useSubscription({ ...props, itemKey: props.itemKey, keyPrefix: props.keyPrefix })
  const { fields: existingItems } = useSubscription({ ...props, itemKey: props.itemKey, keyPrefix: undefined })
  logger.log('AddExistingItemProperties', 'props:', props, 'currentItems:', currentItems, 'existingItems:', existingItems)

  const handleItemValueChange = (_, newValue) => {
    // logger.log('AddExistingItemControl handleItemValueChange', newValue)
    if (newValue === null) {
      setItemValue({ value: null, label: "" });
    }
    else {
      setItemValue(newValue)
    }
  }

  const handleItemTextChange = (event) => {
    setItemValue({ ...itemValue, label: event.target.value ?? "" })
  }

  const handleAddItemConfirmClick = () => {
    logger.log('AddExistingItemProperties handleAddItemConfirmClick', 'itemKey:', props.itemKey, 'itemValue:', itemValue)
    props.onAddItemConfirmClick && props.onAddItemConfirmClick(
      { id: itemValue.value }
    );
    setItemValue({ value: null, label: "" });
  };

  const options = Object.keys(existingItems).map(existingItemKey => {
    return { value: existingItemKey, label: existingItems[existingItemKey].label ?? existingItems[existingItemKey].name }
  })

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
              onChange={handleItemTextChange}
            />
          )}
        />
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
  )
}

function AddCollectionItemControl({ addingItem, setAddingItem, ...props }) {
  logger.log('AddCollectionItemControl', 'props:', props)

  const handleAddItemConfirmClick = (addedProperties) => {
    logger.log('AddCollectionItemControl handleAddItemConfirmClick', 'addedProperties:', addedProperties)

    const itemKey = props.keyPrefix
      ? `${props.keyPrefix.split('.')[0]}`
      : props.itemKey

    const keyPrefix = props.keyPrefix
      ? `${props.keyPrefix}.${props.itemKey}`
      : props.itemKey


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
    }

    const itemsToAdd = {
      [keyPrefix]: propertiesToAdd
    }

    logger.log('AddCollectionItemControl props.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')')
    props.addItems(itemKey, itemsToAdd)

    setAddingItem(false);
  };

  const handleAddItemCancelClick = () => {
    logger.log('AddCollectionItemControl handleAddItemCancelClick')
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
            onAddItemCancelClick={handleAddItemCancelClick}
          />
        </Box>
      )}
    </>
  );
}

function AddCollectionItemProperties(props) {

  const [itemName, setItemName] = useState(getNextItemName('collections', props.fields));
  const [itemLabel, setItemLabel] = useState(getNextItemLabel('collections', props.fields));
  const [itemValue, setItemValue] = useState({ value: null, label: "" });
  logger.log('AddCollectionItemProperties', 'props:', props)

  const handleItemValueChange = (_, newValue) => {
    // logger.log('AddExistingItemControl handleItemValueChange', newValue)
    if (newValue === null) {
      setItemValue({ value: null, label: "" });
    }
    else {
      setItemValue(newValue)
    }
  }

  const handleItemTextChange = (event) => {
    setItemValue({ ...itemValue, label: event.target.value ?? "" })
  }

  const handleAddItemConfirmClick = () => {
    logger.log('AddExistingItemProperties handleAddItemConfirmClick', 'itemKey:', props.itemKey, 'itemValue:', itemValue)
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
              onChange={handleItemTextChange}
            />
          )}
        />
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
  )
}

function EditPage(props) {
  logger.log('EditPage', 'props:', props)
  return (
    <>
      <EditItem {...props} />
    </>
  )
}

function EditSection(props) {
  logger.log('EditSection', 'props:', props)
  return (
    <EditItem {...props}>
      <EditProperty controllerName={`${props.keyPrefix}.width`} label="Width" />
      {props.valueKeys.hasOwnProperty('type') && (
        <EditCollectionTypeProperty controllerName={`${props.keyPrefix}.type`} label="Type" />
      )}
    </EditItem>
  )
}

function EditView(props) {
  logger.log('EditView', 'props:', props)
  return (
    <EditItem {...props} />
  )
}

function EditGroup(props) {
  logger.log('EditGroup', 'props:', props)
  return (
    <EditItem {...props}>
      <EditProperty controllerName={`${props.keyPrefix}.width`} label="Width" />
    </EditItem>
  )
}

function EditField(props) {
  logger.log('EditField', 'props:', props)
  return (
    <EditItem {...props}>
      <EditFieldTypeProperty controllerName={`${props.keyPrefix}.type`} label="Type" />
    </EditItem>
  )
}

function EditItem({ children, fieldKey, ...props }) {
  logger.log('EditItem', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'fieldKey:', fieldKey, 'valueKeys:', props.valueKeys, 'props:', props)

  const missingNestedItems = getMissingNestedItems(props)
  const valueKeys = {
    ...props.valueKeys,
    ...missingNestedItems
  }

  return (
    <>
      <EditReferencedItem {...props} valueKeys={valueKeys} />

      <EditItemProperties {...props} valueKeys={valueKeys} fieldKey={fieldKey}>
        {children}
        <EditNestedItems {...props} valueKeys={valueKeys} />
      </EditItemProperties>

    </>
  )
}

function getMissingNestedItems({ itemKey, valueKeys }) {
  switch (itemKey) {
    case 'sections':
      if (!valueKeys.hasOwnProperty('views')) {
        return { ...valueKeys, views: {} }
      }
      break;
    case 'groups':
      if (!valueKeys.hasOwnProperty('fields')) {
        return { ...valueKeys, fields: {} }
      }
      break;
    default:
      break;
  }

  return {}
}

function EditReferencedItem({ valueKeys, ...props }) {
  logger.log('EditReferencedItem', 'valueKeys:', valueKeys, 'props:', props)

  if (valueKeys !== null && valueKeys?.id !== undefined) {
    return (
      <>
        <EditItems {...props} keyPrefix={undefined} searchSuffix={valueKeys.id} />
      </>
    )
  }
  return null;
}

function EditItemProperties({ valueKeys, fieldKey, children, ...props }) {
  logger.log('EditItemProperties', 'valueKeys:', valueKeys, 'fieldKey:', fieldKey, 'props:', props)

  const [openFields, setOpenFields] = useState([]);

  if (valueKeys !== null && valueKeys?.id !== undefined) {
    return null
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
  )
}

function EditItemHeader({ onClick, ...props }) {
  const itemKey = `${props.keyPrefix}`
  const keyPrefix = undefined
  const { fields: nameFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'name' })
  const { fields: labelFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'label' })

  logger.log('EditItemHeader', 'nameFields:', nameFields, 'labelFields:', labelFields, 'props:', props)

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
        secondaryTypographyProps={{ noWrap: true }}
      />
    </ListItem>
  )
}

function EditItemLabel({ onClick, ...props }) {
  const itemKey = `${props.keyPrefix}`
  const keyPrefix = undefined
  const { fields: labelFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'label' })

  logger.log('EditItemLabel', 'labelFields:', labelFields, 'props:', props)

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
  )
}

function EditNestedItems({ valueKeys, keyPrefix, ...props }) {
  logger.log('EditNestedItems', 'valueKeys:', valueKeys, 'keyPrefix:', keyPrefix, 'props:', props)
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
        )
      })}

      {/* {!valueKeys.hasOwnProperty('sections') && (
        <AddNewItemControl {...props} />
      )} */}
    </>
  )
}

function EditProperty({ controllerName, label, ...props }) {
  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledTextField {...nextProps} label={label} />
        }}
      />
    </FieldWrapper>
  )
}

function EditCollectionTypeProperty({ controllerName, label, ...props }) {

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={collectionTypes} defaultValue={collectionTypes[0]?.value} />
        }}
      />
    </FieldWrapper>
  )
}

function EditFieldTypeProperty({ controllerName, label, ...props }) {

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledAutocompleteField {...nextProps} label={label} menuItems={fieldTypes} />
        }}
      />
    </FieldWrapper>
  )
}




function FieldItem({ render, ...props }) {
  logger.log('FieldItem', props)

  const handleChange = (onChange) => {

    const onChangeCallback = (event, newValue) => {
      logger.log('FieldItem calling form onChange', event?.target?.value, newValue)
      onChange(event, newValue)
    }

    return (event, newValue) => {
      props.broadcast(props.contextKey ?? props.itemKey, props.name, event, newValue)
      onChangeCallback(event, newValue)
    }
  }

  return render({ ...props, onChange: handleChange })
}

function ControlledField(props) {
  switch (props.type) {
    case "0":
      return <ControlledTextField {...props} />
    case "1":
      return <ControlledAutocompleteField {...props} />
  }

  return null;
}

function ControlledTextField({ name, ...props }) {

  const defaultValue = props.getData(name) ?? ""
  const label = props.label ?? name

  logger.log('ControlledTextField', 'name:', name, 'defaultValue:', defaultValue, 'props:', props)


  return (
    <Controller
      control={props.formMethods.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) => {
        // logger.log('render TextField', controllerName)
        const handleChange = props.onChange(onChange)

        return (
          <TextField
            label={label}
            size="small"
            sx={{ fontSize: 'small' }}
            fullWidth
            {...props.inputProps}
            value={value}
            onChange={handleChange}
          />
        )
      }}
    />
  )
}

function ControlledAutocompleteField({ name, ...props }) {

  const defaultValue = props.getData(name) ?? props.defaultValue ?? null
  const label = props.label ?? name
  logger.log('ControlledAutocompleteField', 'name:', name, 'defaultValue:', defaultValue, 'props:', props)

  const menuItems = props.menuItems ?? [{ value: '0', label: 'test0' }, { value: '1', label: 'test1' }, { value: '2', label: 'test2' },
  { value: '3', label: 'test3' }, { value: '4', label: 'test4' }, { value: '5', label: 'test5' }]

  const componentProps = {
    autoComplete: true,
    autoSelect: true,
    autoHighlight: true,
    options: menuItems
  }

  function getSelectedItem(menuItems, value) {
    return menuItems?.find(item => item.value === value) ?? null;
  }

  return (
    <Controller
      control={props.formMethods.control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange } }) => {
        logger.log('render ControlledAutocomplete', name, value)

        const handleChange = (_, newValue) => {
          logger.log('ControlledAutocomplete handleChange', newValue)
          const action = props.onChange((_, value) => {
            onChange(value)
          })
          action(_, newValue?.value ?? null)
        }

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
                {...params}
              />
            )}
          />
        )
      }}
    />
  )
}

const FieldWrapper = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  padding: `${theme.spacing(1)} ${theme.spacing(0)}`,
  boxSizing: 'border-box',
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));




function ChildrenWithProps({ children, ...props }) {

  const childrenWithProps = Children.map(children, child => {
    if (isValidElement(child)) {
      const newChild = cloneElement(child, { ...props });
      return newChild
    }
    return child;
  });

  logger.log('ChildrenWithProps', 'render:', props.render === undefined, 'props:', props)
  if (props.render === undefined) {
    return childrenWithProps;
  }

  logger.log('ChildrenWithProps', 'childrenWithProps:', childrenWithProps)
  return Children.map(childrenWithProps, child => {
    logger.log('ChildrenWithProps', 'child:', child)
    return props.render(child)
  })

}