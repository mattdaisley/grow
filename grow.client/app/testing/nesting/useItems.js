'use client';
import { useRef, useEffect, useCallback, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import logger from "../../../../grow.api/src/logger";
import { SocketContext } from "../../SocketContext";

export function useItems(defaultItemKeys) {

  const [itemKeys, setItemKeys] = useState([])
  const [loadedItemKeys, setLoadedItemKeys] = useState([])

  logger.log('useItems', 'itemKeys:', itemKeys, 'defaultItemKeys:', defaultItemKeys);

  const socket = useContext(SocketContext);

  const itemsRef = useRef({
    itemKeys: [],
    data: {},
    dataMap: new Map(),
    dataMapTree: new Map(),
    broadcasted: {},
    subscriptionsMap: new Map()
  });

  const formMethods = useForm();
  itemsRef.current.formMethods = formMethods;

  itemsRef.current.getData = (valueKey) => {
    const dataItem = itemsRef.current.dataMap.get(valueKey)
    logger.log('getData', 'itemKeys:', itemKeys, 'valueKey:', valueKey, 'dataMapItem:', dataItem);
    return dataItem;
  };

  itemsRef.current.getNestedData = (name) => {
    logger.log('getNestedData', name, itemsRef.current.data)
    const nestedData = {};
    Object.keys(itemsRef.current.data)
      .filter((dataKey) => dataKey.startsWith(name))
      .map(dataKey => nestedData[dataKey] = itemsRef.current.data[dataKey]);
    return nestedData;
  };

  itemsRef.current.getNestedDataObject = (name) => {
    logger.log('getNestedDataObject', name, itemsRef.current.data)
    const nestedData = {};
    Object.keys(itemsRef.current.data)
      .filter((dataKey) => dataKey.startsWith(name))
      .map(dataKey => nestedData[dataKey.replace(name + '.', '')] = itemsRef.current.data[dataKey]);
    return nestedData;
  }

  itemsRef.current.getTreeMapItem = (searchName) => {
    const searchNameSplit = searchName.split('.')
    return getNodeFromTreeMap(itemsRef, searchNameSplit)
  }

  // can probably be temporary until this is a feature of getData
  // getData could have signature (itemKey, valueKey, callback) to support automatic subscription
  itemsRef.current.getItems = (requestedItemKeys) => {
    logger.log('getItems', 'requestedItemKeys:', requestedItemKeys, 'itemsRef.current.itemKeys:', itemsRef.current.itemKeys, 'itemKeys:', itemKeys)
    const newItemKeys = requestedItemKeys.filter(requestedItemKey => !itemKeys.includes(requestedItemKey))
    if (newItemKeys.length > 0) {
      setItemKeys([...itemKeys, ...newItemKeys])
    }
  }

  itemsRef.current.broadcast = (itemKey, valueKey, event, value) => {
    logger.log('broadcast', itemKey, valueKey, event.type, event?.target?.value, value);

    // const itemKey = valueKey.split('.')[0];

    let newValue;
    switch (event.type) {
      case 'change':
        newValue = event.target.value;
        break;
      case 'click':
      default:
        newValue = value;
        break;
    }

    // old data Object structure still needed by a few places
    itemsRef.current.data[valueKey] = newValue;
    itemsRef.current.broadcasted[valueKey] = newValue;

    // new subscriptions and data Map structure
    updateDataMapTree(itemsRef, valueKey, newValue)
    itemsRef.current.dataMap.set(valueKey, newValue)

    const setItemsEvent = { itemKey, values: { [valueKey]: newValue } };
    socket?.emit('set-items', setItemsEvent);
    logger.log('broadcast socket emit set-item:', itemKey, setItemsEvent);
  };

  itemsRef.current.addItems = (itemKey, items) => {
    if (Object.keys(items).length > 0) {
      const addItemsEvent = { itemKey, items };
      socket.emit('add-items', addItemsEvent);
      logger.log('addItems socket emit add-items:', addItemsEvent);
    }
  };

  itemsRef.current.deleteItems = (itemKey, items) => {
    if (Object.keys(items).length > 0) {
      const deleteItemsEvent = { itemKey, items };
      socket.emit('delete-items', deleteItemsEvent);
      logger.log('deleteItems socket emit delete-items:', deleteItemsEvent);
    }
  };

  itemsRef.current.subscribeMap = (valueKey, callback) => {
    const currentCallbacks = itemsRef.current.subscriptionsMap.get(valueKey) ?? []
    const newCallbacks = [...currentCallbacks, callback];
    itemsRef.current.subscriptionsMap.set(valueKey, newCallbacks)
    // logger.log('subscribeMap', 'valueKey:', valueKey, 'currentCallbacks:', currentCallbacks, 'callbacks:', newCallbacks)
  }

  itemsRef.current.unsubscribeMap = (valueKey, callback) => {
    const currentCallbacks = itemsRef.current.subscriptionsMap.get(valueKey)
    const callbackIndex = currentCallbacks?.indexOf(callback);
    if (callbackIndex > -1) {
      const newCallbacks = [...currentCallbacks]
      newCallbacks.splice(callbackIndex, 1)
      itemsRef.current.subscriptionsMap.set(valueKey, newCallbacks)
      logger.log('unsubscribeMap', 'valueKey:', valueKey, 'callbacks:', newCallbacks)
    }
    else {
      logger.log('unsubscribeMap nothing to unsubscribe', 'valueKey:', valueKey, 'callbacks:', currentCallbacks)
    }
  }

  itemsRef.current.runSubscriptionsMap = (valueKey) => {

    const subscriptionsMap = itemsRef.current.subscriptionsMap

    if (subscriptionsMap.size === 0) {
      // logger.log('runSubscriptionsMap no subscriptions to run', 'subscriptionsMap:', subscriptionsMap);
      return;
    }

    const mapCallbacks = subscriptionsMap.get(valueKey)
    const value = itemsRef.current.getTreeMapItem(valueKey)

    mapCallbacks?.forEach(callback => callback(valueKey, value));
  }

  useEffect(() => {
    setItemKeys(defaultItemKeys)
  }, [])

  useEffect(() => {

    function loadItems() {
      itemKeys
        .filter(itemKey => !itemsRef.current.itemKeys?.includes(itemKey))
        .map(itemKey => {
          const dynamicItemsRequest = { itemKey };
          socket?.emit('get-items', dynamicItemsRequest);
          logger.log('useItems socket emit get-items', dynamicItemsRequest);
        });

      itemsRef.current.itemKeys = itemKeys
      setLoadedItemKeys(itemKeys)
    }

    loadItems();
  }, [JSON.stringify(itemKeys), socket]);

  useEffect(() => {
    itemKeys.map(itemKey => {
      socket?.on(`items-${itemKey}`, handleReceiveAllItems);
    });

    return () => {
      itemKeys.map(itemKey => {
        socket?.off(`items-${itemKey}`, handleReceiveAllItems);
      });
    };
  }, [JSON.stringify(itemKeys), socket, handleReceiveAllItems]);

  function handleReceiveAllItems(receivedData) {
    logger.log('handleReceiveAllItems socket', 'receivedData:', receivedData);

    const newData = {};
    Object.keys(receivedData).map(itemKey => {

      receivedData[itemKey].map(item => {

        const valueKey = item.valueKey;
        const value = item.value;
        const broadcastedValue = itemsRef.current.broadcasted[valueKey];

        if (broadcastedValue === undefined) {

          newData[valueKey] = value;
          itemsRef.current.dataMap.set(valueKey, value)
          updateDataMapTree(itemsRef, valueKey, value)
          // logger.log('handleReceiveAllItems dataMapTree', itemsRef.current.dataMapTree)

          const { setValue } = itemsRef.current.formMethods;
          setValue(valueKey, value);
        }
        else if (broadcastedValue === value) {
          logger.log('handleReceiveAllItems confirm broadcasted value', valueKey, itemsRef.current.broadcasted[valueKey]);
          delete itemsRef.current.broadcasted[valueKey];
        }
        else {
          logger.log('handleReceiveAllItems received value out of date', broadcastedValue, value);
        }
      });
    });

    itemsRef.current.data = {
      ...itemsRef.current.data,
      ...newData
    };
    logger.log('handleReceiveAllItems newData', itemsRef.current.data, 'dataMap', itemsRef.current.dataMap);
  }

  const setRef = useCallback(() => {
    return itemsRef.current
  }, [JSON.stringify(loadedItemKeys)])

  return setRef()

  // return itemsRef.current;
}

function updateDataMapTree(itemsRef, valueKey, value) {
  const dataMapTree = itemsRef.current.dataMapTree
  const valueKeySplit = valueKey.split('.');
  const valueKeySplitIndex = 0;

  updateDataMapBranch(itemsRef, dataMapTree, valueKeySplit, valueKeySplitIndex, value)
}

function updateDataMapBranch(itemsRef, dataMapBranch, valueKeySplit, valueKeySplitIndex, value) {

  const keyAtIndex = valueKeySplit?.[valueKeySplitIndex]
  const valueKey = valueKeySplit.slice(0, valueKeySplitIndex + 1).join('.')

  // logger.log('updateDataMapBranch', 'valueKeySplitIndex:', valueKeySplitIndex, 'valueKey:', valueKey, 'valueKeySplit:', valueKeySplit, 'value:', value, 'dataMapBranch:', dataMapBranch)

  if (valueKeySplitIndex === valueKeySplit.length - 1) {
    dataMapBranch.set(keyAtIndex, value)
    itemsRef.current.runSubscriptionsMap(valueKey, value)
    return dataMapBranch;
  }

  if (!dataMapBranch.has(keyAtIndex)) {
    dataMapBranch.set(keyAtIndex, new Map())
  }

  const newDataMapBranch = updateDataMapBranch(itemsRef, dataMapBranch.get(keyAtIndex), valueKeySplit, valueKeySplitIndex + 1, value)
  itemsRef.current.runSubscriptionsMap(valueKey, newDataMapBranch)
  return newDataMapBranch;
}

function getNodeFromTreeMap(itemsRef, valueKeySplit) {
  const dataMapTree = itemsRef.current.dataMapTree

  return getNodeFromTreeBranch(dataMapTree, valueKeySplit)
}

function getNodeFromTreeBranch(dataMapBranch, valueKeySplit) {

  // logger.log('getNodeFromTreeBranch', 'valueKeySplit:', valueKeySplit, 'dataMapBranch:', dataMapBranch)
  const firstKey = valueKeySplit?.[0]

  if (valueKeySplit.length === 1) {
    return dataMapBranch.get(firstKey)
  }

  if (!dataMapBranch.has(firstKey)) {
    return undefined
  }

  return getNodeFromTreeBranch(dataMapBranch.get(firstKey), valueKeySplit.slice(1))
}