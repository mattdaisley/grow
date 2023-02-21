'use client';

import { Children, cloneElement, Fragment, isValidElement, useRef, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { FormProvider, useForm, Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';

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
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import logger from "../../../../grow.api/src/logger";
import { SocketContext } from "../../SocketContext";
import { unflatten } from 'flat';

const itemTypes = ['pages', 'sections', 'views', 'groups', 'fields'];
const fieldTypes = [{ value: '0', label: 'textfield' }, { value: '1', label: 'autocomplete' }]

export default function TestingNestingPage() {

  const itemKeys = ['preview', 'pages', 'views', 'fields']

  const items = useItems(itemKeys);

  logger.log('TestingNestingPage', items)

  return (
    <Grid xs={12} container sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1, py: 4, pl: { xs: 2, md: 4 } }}>
        <Grid container xs={12} spacing={0}>
          <Grid xs={8}>
            <Grid container spacing={4} xs={12} sx={{ width: '100%' }}>
              <ShowItems contextKey={'preview'} itemKey={'pages'} {...items} />
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



function useItems(itemKeys) {
  logger.log('useItems', itemKeys)

  const socket = useContext(SocketContext);

  const itemsRef = useRef({ itemKeys })
  itemsRef.current = {
    itemKeys,
    data: {},
    broadcasted: {},
    subscriptions: {}
  }

  const formMethods = useForm();
  itemsRef.current.formMethods = formMethods;

  itemsRef.current.getData = (name) => {
    logger.log('getData', name, itemsRef.current.data?.[name])
    return itemsRef.current.data?.[name];
  }

  itemsRef.current.getNestedData = (name) => {
    // logger.log('getNestedData', name, itemsRef.current.data)
    const nestedData = {};
    Object.keys(itemsRef.current.data)
      .filter((dataKey) => dataKey.startsWith(name))
      .map(dataKey => nestedData[dataKey] = itemsRef.current.data[dataKey])
    return nestedData
  }

  itemsRef.current.broadcast = (valueKey, event, value) => {
    logger.log('broadcast', valueKey, event.type, event?.target?.value, value)

    const itemKey = valueKey.split('.')[0]

    let newValue
    switch (event.type) {
      case 'change':
        newValue = event.target.value;
        break;
      case 'click':
      default:
        newValue = value;
        break;
    }

    runSubscriptions(itemsRef.current.subscriptions, itemsRef.current.data, valueKey, newValue)

    itemsRef.current.data[valueKey] = newValue
    itemsRef.current.broadcasted[valueKey] = newValue

    const setItemsEvent = { itemKey, values: { [valueKey]: newValue } }
    socket?.emit('set-items', setItemsEvent)
    logger.log('broadcast socket emit set-item:', itemKey, setItemsEvent)
  }

  itemsRef.current.subscribe = (valueKey, callback) => {
    // itemsRef.current.subscriptions[valueKey] = callback
    if (itemsRef.current.subscriptions[valueKey] === undefined) {
      itemsRef.current.subscriptions[valueKey] = []
    }
    itemsRef.current.subscriptions[valueKey].push(callback)
  }

  function runSubscriptions(subscriptions, data, valueKey, value) {
    logger.log('runSubscriptions', subscriptions, valueKey, value, data)
    // if (subscriptions.hasOwnProperty(valueKey)) {
    // const callback = subscriptions[valueKey]
    // callback(valueKey, value)
    // }
    // else {
    Object.keys(subscriptions).map(subscriptionKey => {
      if (subscriptionKey === valueKey) {
        // const callback = subscriptions[valueKey]
        // callback(valueKey, value)
        const callbacks = subscriptions[valueKey]
        callbacks?.map(callback => callback(valueKey, value))
      }
      else if (valueKey.startsWith(subscriptionKey)) {
        const nestedDataKeys = {};
        Object.keys(data)
          .filter((dataKey) => dataKey.startsWith(subscriptionKey))
          .map(dataKey => nestedDataKeys[dataKey] = data[dataKey])
        logger.log('runSubscriptions nestedData', subscriptionKey, valueKey, nestedDataKeys)
        if (nestedDataKeys.length === 0 || !nestedDataKeys.hasOwnProperty(valueKey)) {
          // an item was updated
          // const callback = subscriptions[subscriptionKey]
          // callback(valueKey, value)
          const callbacks = subscriptions[subscriptionKey]
          callbacks?.map(callback => callback(valueKey, value))
        }
        else {
          // a new item was added
        }
      }
    })

    // Object.keys(data).map(dataKey => {
    //   if (valueKey.startsWith(dataKey)) {
    //     const callback = subscriptions[subscriptionKey]
    //     callback(valueKey, value)
    //   }
    // })

    // Object.keys(subscriptions).map(subscriptionKey => {
    //   if (valueKey.startsWith(subscriptionKey)) {
    //     const callback = subscriptions[subscriptionKey]
    //     callback(valueKey, value)
    //   }
    // })
    // }
  }

  useEffect(() => {
    function loadItems() {
      itemKeys.map(itemKey => {
        const data = { itemKey };
        socket?.emit('get-items', data)
        logger.log('useItems socket emit get-items', data)
      })
    }

    loadItems()
  }, [JSON.stringify(itemKeys), socket])

  useEffect(() => {
    itemKeys.map(itemKey => {
      socket?.on(`items-${itemKey}`, handleReceiveAllItems)
    })

    return () => {
      itemKeys.map(itemKey => {
        socket?.off(`items-${itemKey}`, handleReceiveAllItems)
      })
    };
  }, [JSON.stringify(itemKeys), socket, handleReceiveAllItems])

  function handleReceiveAllItems(data) {
    logger.log('handleReceiveAllItems socket', data)

    const newData = {}
    Object.keys(data).map(itemKey => {
      data[itemKey].map(item => {
        const valueKey = item.valueKey
        const value = item.value
        const broadcastedValue = itemsRef.current.broadcasted[valueKey]
        if (broadcastedValue === undefined) {
          newData[valueKey] = value;
          const { setValue } = itemsRef.current.formMethods
          setValue(valueKey, value)
          runSubscriptions(itemsRef.current.subscriptions, itemsRef.current.data, valueKey, value)
        }
        else if (broadcastedValue === value) {
          delete itemsRef.current.broadcasted[valueKey]
          runSubscriptions(itemsRef.current.subscriptions, itemsRef.current.data, valueKey, value)
        }
        else {
          logger.log('handleReceiveAllItems received value out of date', broadcastedValue, value)
        }
      })
    })

    itemsRef.current.data = {
      ...itemsRef.current.data,
      ...newData
    }
    logger.log('handleReceiveAllItems newData', itemsRef.current.data)
  }

  return itemsRef.current;
}

function useSubscription(props) {

  const [fields, setFields] = useState({})
  const _fieldsRef = useRef({})

  let name = props.keyPrefix === undefined ? props.itemKey : `${props.keyPrefix}.${props.itemKey}`
  let searchName = props.searchSuffix === undefined ? name : `${name}.${props.searchSuffix}`

  logger.log('useSubscription', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'searchSuffix:', props.searchSuffix, 'name:', name, 'searchName:', searchName, 'props:', props)

  useEffect(() => {
    const nestedData = props.getNestedData(searchName)
    const newFields = {}
    Object.keys(nestedData).map(nestedDataKey => {
      const trimmedKey = nestedDataKey.substring(name.length + 1, nestedDataKey.length)
      newFields[trimmedKey] = nestedData[nestedDataKey]
    })

    updateFields(_fieldsRef, newFields, setFields)
    logger.log('useSubscription useEffect', 'name:', name, 'newFields:', newFields, 'nestedData:', nestedData)

    props.subscribe(searchName, (valueKey, value) => {
      logger.log('useSubscription subscribed change', searchName, valueKey, value)
      const trimmedKey = valueKey.substring(name.length + 1, valueKey.length)
      updateFields(_fieldsRef, { ..._fieldsRef.current, [trimmedKey]: value }, setFields)
    })
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
  logger.log('ShowControls', 'name:', name, 'itemKey:', props.itemKey, 'fields:', fields)

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
        const itemKeys = fields[fieldKey]

        logger.log('ShowControls rendering', 'fieldKey:', fieldKey, 'itemKeys:', itemKeys)

        const ShowControl = getShowControl(props.itemKey)

        if (ShowControl === null) {
          return null;
          // use below to debug missing properties
          // return (
          //   <div key={fieldKey}>
          //     {props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(itemKeys, null, 2)} />
          //   </div>
          // )
        }

        return <ShowControl key={fieldKey} {...props} keyPrefix={keyPrefix} fieldKey={fieldKey} itemKeys={itemKeys} />
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
  const searchSuffix = 'width'
  const { name: widthName, fields: widthFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix })

  logger.log('ShowSection', 'widthName:', widthName, 'widthFields:', widthFields, 'props:', props)

  return (
    <Grid xs={Number(widthFields.width) || 12} alignContent={'flex-start'}>
      <Paper sx={{ width: '100%' }}>
        <Grid container spacing={1} xs={12} sx={{ py: 1, px: 2 }}>
          <ShowItem {...props} />
        </Grid>
      </Paper>
    </Grid>
  )
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
        props.itemKeys.hasOwnProperty('type')
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

  const controllerName = `${props.contextKey}.${nameFields.name}`
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

function ShowItem({ children, keyPrefix, fieldKey, itemKeys, ...props }) {
  logger.log('ShowItem', 'itemKey:', props.itemKey, 'keyPrefix:', keyPrefix, 'fieldKey:', fieldKey, 'itemKeys:', itemKeys, 'props:', props)

  return (
    <>
      <ShowReferencedItem {...props} itemKeys={itemKeys} />
      <ShowItemProperties {...props} itemKeys={itemKeys} fieldKey={fieldKey}>
        {children}
      </ShowItemProperties>

      <ShowNestedItems {...props} itemKeys={itemKeys} keyPrefix={keyPrefix} />
    </>
  )
}

function ShowItemLabel(props) {
  const itemKey = `${props.itemKey}.${props.fieldKey}`
  const keyPrefix = undefined
  const searchSuffix = 'label'
  const { fields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix })

  logger.log('ItemLabel', 'labelFields:', fields, 'props:', props)

  if (fields?.label === undefined) {
    return null;
  }

  return (
    <Grid xs={12} sx={{ mb: -1 }}>
      <Typography variant="h5" sx={{ borderBottom: 1, borderColor: 'grey.300', px: 1 }}>{fields.label}</Typography>
    </Grid>
  )
}

function ShowReferencedItem({ itemKeys, ...props }) {
  logger.log('ShowReferencedItem', 'itemKeys:', itemKeys, 'props:', props)

  if (itemKeys.id !== undefined) {
    return <ShowItems {...props} keyPrefix={undefined} searchSuffix={itemKeys.id} />;
  }
  return null;
}

function ShowItemProperties({ itemKeys, fieldKey, children, ...props }) {
  logger.log('ShowItemProperties', 'itemKeys:', itemKeys, 'fieldKey:', fieldKey, 'props:', props)

  if (itemKeys.id === undefined) {
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

function ShowNestedItems({ itemKeys, keyPrefix, ...props }) {
  return (
    <>
      {Object.keys(itemKeys).map(itemKey => {
        logger.log('ShowNestedItems nested itemKey:', itemKey)
        if (itemTypes.includes(itemKey) === false) {
          return null;
        }

        return (
          <ShowItems key={itemKey} {...props} keyPrefix={keyPrefix} itemKey={itemKey} />
        )
      })}
    </>
  )
}




function EditItems({ searchSuffix, ...props }) {

  const { name, fields } = useSubscription({ searchSuffix, ...props })

  logger.log('EditItems', 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props)

  if (Object.keys(fields).length === 0) {
    return null;
  }

  return (
    <EditControls {...props} name={name} fields={fields} />
  )
}

function EditControls({ name, fields, ...props }) {
  logger.log('EditControls', 'name:', name, 'itemKey:', props.itemKey, 'fields:', fields)

  function getEditControl(itemKey) {
    switch (itemKey) {
      case 'pages':
        return EditPage
      case 'sections':
        return EditSection
      case 'groups':
        return EditGroup
      case 'views':
        return EditView
      case 'fields':
        return EditField
      default:
        return null;
    }
  }

  return (
    <>
      {Object.keys(fields).map((fieldKey, index) => {

        const keyPrefix = `${name}.${fieldKey}`
        const itemKeys = fields[fieldKey]

        logger.log('EditControls rendering', 'fieldKey:', fieldKey, 'itemKeys:', itemKeys)

        const EditControl = getEditControl(props.itemKey)

        if (EditControl === null) {
          return null;
          // use below to debug missing properties
          // return (
          //   <div key={fieldKey}>
          //     {props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(itemKeys, null, 2)} />
          //   </div>
          // )
        }

        return (
          <Fragment key={fieldKey}>
            <EditControl {...props} keyPrefix={keyPrefix} fieldKey={fieldKey} itemKeys={itemKeys} />
            {index !== Object.keys(fields).length - 1 && <Divider />}
          </Fragment>
        )
      })}
    </>
  )
}

function EditPage(props) {
  logger.log('EditPage', 'props:', props)
  return (
    <EditItem {...props} />
  )
}

function EditSection(props) {
  logger.log('EditSection', 'props:', props)
  return (
    <EditItem {...props}>
      <EditProperty controllerName={`${props.keyPrefix}.width`} label="Width" />
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

function EditItem({ children, fieldKey, itemKeys, ...props }) {
  logger.log('EditItem', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'fieldKey:', fieldKey, 'itemKeys:', itemKeys, 'props:', props)

  return (
    <>
      <EditReferencedItem {...props} itemKeys={itemKeys} />

      <EditItemProperties {...props} itemKeys={itemKeys} fieldKey={fieldKey}>
        {children}
        <EditNestedItems {...props} itemKeys={itemKeys} />
      </EditItemProperties>

    </>
  )
}

function EditReferencedItem({ itemKeys, ...props }) {
  logger.log('EditReferencedItem', 'itemKeys:', itemKeys, 'props:', props)

  if (itemKeys.id !== undefined) {
    return <EditItems {...props} keyPrefix={undefined} searchSuffix={itemKeys.id} />;
  }
  return null;
}

function EditItemProperties({ itemKeys, fieldKey, children, ...props }) {
  logger.log('EditItemProperties', 'itemKeys:', itemKeys, 'fieldKey:', fieldKey, 'props:', props)

  const [openFields, setOpenFields] = useState([]);

  if (itemKeys.id !== undefined) {
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

        <Collapse in={isOpen} timeout="auto">
          <EditItemLabel {...props} onClick={handleClick} />

          <Stack spacing={0} sx={{ px: 2, py: 2 }}>
            <EditProperty {...props} controllerName={`${props.keyPrefix}.name`} label="Name" />

            <ChildrenWithProps {...props} openFields={openFields}>
              {children}
            </ChildrenWithProps>
          </Stack>
        </Collapse>
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

function EditNestedItems({ itemKeys, keyPrefix, ...props }) {
  return (
    <>
      {Object.keys(itemKeys).map(itemKey => {
        // logger.log('EditNestedItems nested itemKey:', itemKey)k
        if (itemTypes.includes(itemKey) === false) {
          return null;
        }

        return (
          <Box sx={{ mt: 1, flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
            <EditItems key={itemKey} {...props} keyPrefix={keyPrefix} itemKey={itemKey} />
          </Box>
        )
      })}
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
      props.broadcast(props.name, event, newValue)
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

  const defaultValue = props.getData(name) ?? null
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