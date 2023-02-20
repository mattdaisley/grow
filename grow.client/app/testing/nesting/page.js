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
    itemsRef.current.subscriptions[valueKey] = callback;
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
        const callback = subscriptions[valueKey]
        callback(valueKey, value)
      }
      else if (valueKey.startsWith(subscriptionKey)) {
        const nestedDataKeys = {};
        Object.keys(data)
          .filter((dataKey) => dataKey.startsWith(subscriptionKey))
          .map(dataKey => nestedDataKeys[dataKey] = data[dataKey])
        logger.log('runSubscriptions nestedData', subscriptionKey, valueKey, nestedDataKeys)
        if (nestedDataKeys.length === 0 || !nestedDataKeys.hasOwnProperty(valueKey)) {
          // an item was updated
          const callback = subscriptions[subscriptionKey]
          callback(valueKey, value)
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

export default function TestingNestingPage() {

  // const itemKeys = ['pages', 'test0', 'test1']
  const itemKeys = ['pages', 'views', 'fields']


  const items = useItems(itemKeys);

  logger.log('TestingNestingPage', items)
  const contexts = ['pages', 'sections', 'views', 'groups', 'fields']
  const types = ['text', 'autocomplete']
  const randomWords = ['guest', 'art', 'mud', 'length', 'dirt', 'child', 'lab', 'depth', 'bath']

  const names = []
  for (let i = 0; i < 10; i++) {
    const itemIndex = Math.floor(i / 5)
    const prefix = contexts[Math.round(i % 3)]
    const randomWord = randomWords[Math.floor(i / 2)]
    const type = types[Math.round(i % 2)]
    names.push({ name: `test${itemIndex}.${prefix}.${randomWord}`, type })
  }

  return (
    <Grid xs={12} container sx={{ width: '100%' }}>
      <Grid xs={6}>
        <ShowItems itemKey={'pages'} {...items} />
      </Grid>
      <Grid xs={6} sx={{ p: 2 }}>
        {/* {names.map((name, index) => (
          <NestLevel1 key={index} {...name} {...items} />
        ))} */}
      </Grid>
    </Grid>
  )
}

function ShowItems({ searchSuffix, ...props }) {
  const [fields, setFields] = useState({})
  const _fieldsRef = useRef({})

  logger.log('ShowItems', 'keyPrefix:', props.keyPrefix, 'itemKey:', props.itemKey, 'searchSuffix:', searchSuffix, 'fields:', fields, 'props:', props)

  let name = props.itemKey
  if (props.keyPrefix) {
    name = `${props.keyPrefix}.${name}`
  }
  let searchName = name;
  if (searchSuffix) {
    searchName = `${name}.${searchSuffix}`
  }

  useEffect(() => {
    const nestedData = props.getNestedData(searchName)
    const newFields = {}
    Object.keys(nestedData).map(nestedDataKey => {
      const trimmedKey = nestedDataKey.substring(name.length + 1, nestedDataKey.length)
      newFields[trimmedKey] = nestedData[nestedDataKey]
    })
    if (_fieldsRef?.current !== undefined) {
      _fieldsRef.current = newFields
      setFields(unflatten(_fieldsRef.current, { object: true }))
    }
    logger.log('ShowItems useEffect', 'name:', name, 'newFields:', newFields)
  }, [name])

  props.subscribe(name, (valueKey, value) => {
    // logger.log('ShowItems subscribed change', name, valueKey, value)
    const trimmedKey = valueKey.substring(name.length + 1, valueKey.length)

    if (_fieldsRef?.current !== undefined) {
      _fieldsRef.current = {
        ..._fieldsRef.current,
        [trimmedKey]: value
      }
      setFields(unflatten(_fieldsRef.current, { object: true }))
    }
  })

  if (Object.keys(fields).length === 0) {
    return null;
  }

  return (
    <ShowControls {...props} name={name} fields={fields} />
  )
}

function ShowControls({ name, fields, ...props }) {
  logger.log('ShowControls', 'name:', name, 'itemKey:', props.itemKey, 'fields:', fields)
  return (
    <>
      {Object.keys(fields).map(fieldKey => {
        const itemKeys = fields[fieldKey]
        logger.log('ShowControls rendering', 'fieldKey:', fieldKey, 'itemKeys:', itemKeys)
        switch (props.itemKey) {
          case 'pages':
          case 'sections':
            return (
              <EditPage key={fieldKey} {...props} keyPrefix={`${name}.${fieldKey}`} fieldKey={fieldKey} itemKeys={itemKeys} />
            )
          case 'views':
          case 'groups':
          case 'fields':
            return (
              <EditView key={fieldKey} {...props} keyPrefix={`${name}.${fieldKey}`} fieldKey={fieldKey} itemKeys={itemKeys} />
            )

          default:
            return <div key={fieldKey}>{props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(itemKeys, null, 2)} /></div>
        }
      })}
    </>
  )
}

function EditPage({ keyPrefix, fieldKey, itemKeys, ...props }) {
  logger.log('EditPage', 'itemKey:', props.itemKey, 'keyPrefix:', keyPrefix, 'fieldKey:', fieldKey, 'itemKeys:', itemKeys, 'props:', props)
  const { name: nameProperty, label: labelProperty, width: widthProperty, ...rest } = itemKeys;
  return (
    <div key={fieldKey} style={{ border: '1px solid black', padding: '10px' }}>
      <div>{props.itemKey}.{fieldKey}</div>
      <div style={{ padding: '10px' }}>
        <EditProperty {...props} controllerName={`${keyPrefix}.name`} label="Name" />
        <EditProperty {...props} controllerName={`${keyPrefix}.label`} label="Label" />
        <EditProperty {...props} controllerName={`${keyPrefix}.width`} label="Width" />
      </div>
      <div style={{ paddingLeft: '10px' }}>
        {Object.keys(rest).map(itemKey => {
          return (
            <ShowItems key={itemKey} {...props} keyPrefix={keyPrefix} itemKey={itemKey} />
          )
        })}
      </div>
    </div>
  )
}

function EditView({ keyPrefix, fieldKey, itemKeys, ...props }) {
  logger.log('EditView', 'itemKey:', props.itemKey, 'keyPrefix:', keyPrefix, 'fieldKey:', fieldKey, 'itemKeys:', itemKeys, 'props:', props)
  const { id: idProperty, name: nameProperty, label: labelProperty, width: widthProperty, ...rest } = itemKeys;
  return (
    <div key={fieldKey} style={{ border: '1px solid black', padding: '10px' }}>
      {
        idProperty !== undefined
          ? <ShowItems {...props} keyPrefix={undefined} itemKey={props.itemKey} searchSuffix={itemKeys.id} />
          : (
            <>
              <div>{props.itemKey}.{fieldKey}</div>
              <div style={{ padding: '10px' }}>
                <EditProperty {...props} controllerName={`${keyPrefix}.name`} label="Name" />
                <EditProperty {...props} controllerName={`${keyPrefix}.label`} label="Label" />
                <EditProperty {...props} controllerName={`${keyPrefix}.width`} label="Width" />
              </div>
            </>
          )
      }
      <div style={{ paddingLeft: '10px' }}>
        {Object.keys(rest).map(itemKey => {
          logger.log('Edit view nested', itemKey)
          return (
            <ShowItems key={itemKey} {...props} keyPrefix={keyPrefix} itemKey={itemKey} />
          )
        })}
      </div>
    </div>
  )
}

function EditProperty({ controllerName, label, ...props }) {
  return <FieldItem
    {...props}
    name={controllerName}
    render={(nextProps) => {
      return <ControlledTextField {...nextProps} label={label} />
    }}
  />
}


function NestLevel1({ children, ...props }) {
  logger.log('NestLevel1', props)

  const childrenWithProps = Children.map(children, child => {
    if (isValidElement(child)) {
      const newChild = cloneElement(child, { ...props });
      return newChild
    }
    return child;
  });

  return <div>
    <NestLevel2 secondProp={'test2'} {...props} />
    {childrenWithProps}
  </div>
}

function NestLevel2({ children, ...props }) {
  logger.log('NestLevel2', props)

  const childrenWithProps = Children.map(children, child => {
    if (isValidElement(child)) {
      const newChild = cloneElement(child, { ...props });
      return newChild
    }
    return child;
  });

  return <div>
    <NestLevel3 thirdProp={'test3'} {...props} />
    {childrenWithProps}
  </div>

}

function NestLevel3({ children, ...props }) {

  logger.log('NestLevel3', props)

  const controllerName = `${props.name}.${props.type}`

  return (
    <FieldItem
      {...props}
      name={controllerName}
      render={(nextProps) => {
        switch (props.type) {
          case 'text':
            return <ControlledTextField {...nextProps} />
          case 'autocomplete':
            return <ControlledAutocomplete {...nextProps} />
        }
        return null;
      }}
    />
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

function ControlledTextField({ name, ...props }) {

  const defaultValue = props.getData(name) ?? ""
  const label = props.label ?? name
  logger.log('ControlledTextField', name, defaultValue)

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
            variant="standard"
            size="small"
            sx={{ fontSize: 'small' }}
            fullWidth
            value={value}
            onChange={handleChange}
          />
        )
      }}
    />
  )
}

function ControlledAutocomplete({ name, ...props }) {

  const defaultValue = props.getData(name) ?? null
  logger.log('ControlledTextField', name, defaultValue)


  const menuItems = [{ value: '0', label: 'test0' }, { value: '1', label: 'test1' }, { value: '2', label: 'test2' },
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
          console.log('ControlledAutocomplete handleChange', newValue)
          const action = props.onChange((_, value) => {
            onChange(value)
          })
          action(_, newValue?.value ?? null)
        }

        return (
          <Autocomplete
            fullWidth
            {...componentProps}
            value={getSelectedItem(menuItems, value)}
            onChange={handleChange}
            isOptionEqualToValue={(option, testValue) => option?.id === testValue?.id}
            renderInput={(params) => (
              <TextField
                variant="standard"
                size="small"
                sx={{ fontSize: 'small' }}
                label={`${name} label`}
                {...params}
              />
            )}
          />
        )
      }}
    />
  )
}