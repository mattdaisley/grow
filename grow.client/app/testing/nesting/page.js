'use client';

import { Children, cloneElement, Fragment, isValidElement, useRef, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { FormProvider, useForm, Controller, useFormContext, useFieldArray } from "react-hook-form";
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

function useItems(itemKeys) {
  logger.log('useItems', itemKeys)

  const socket = useContext(SocketContext);

  const itemsRef = useRef({ itemKeys })
  itemsRef.current = {
    itemKeys,
    broadcasted: {},
    data: { 'test.label': "loading" },
  }

  const formMethods = useForm();
  itemsRef.current.formMethods = formMethods;

  itemsRef.current.getData = (name) => {
    logger.log('getData', name, itemsRef.current.data?.[name])
    return itemsRef.current.data?.[name];
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

    itemsRef.current.data[valueKey] = newValue
    itemsRef.current.broadcasted[valueKey] = newValue

    const setItemsEvent = { itemKey, values: { [valueKey]: newValue } }
    socket?.emit('set-items', setItemsEvent)
    logger.log('broadcast socket emit set-item:', itemKey, setItemsEvent)
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
          const { setValue } = itemsRef.current.formMethods
          setValue(valueKey, value)
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
    };
    logger.log('handleReceiveAllItems newData', itemsRef.current.data)
  }

  return itemsRef.current;
}

export default function TestingNestingPage() {

  const items = useItems(['test0', 'test1']);

  logger.log('TestingNestingPage', items)
  const types = ['text', 'autocomplete']

  const names = []
  for (let i = 0; i < 10; i++) {
    names.push({ name: `test${Math.floor(i / 5)}.${Math.floor(i / 2)}`, type: types[Math.round(i % 2)] })
  }

  return (
    <Box sx={{ p: 2 }}>
      {names.map((name, index) => (
        <NestLevel1 key={index} {...name} {...items} />
      ))}
    </Box>
  )
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

function FieldItem(props) {
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

  return props.render({ ...props, onChange: handleChange })
}

function ControlledTextField({ name, ...props }) {

  const defaultValue = props.getData(name) ?? ""
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
            label={`${name} label`}
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