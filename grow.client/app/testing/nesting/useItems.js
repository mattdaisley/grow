'use client';
import { useRef, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import logger from "../../../../grow.api/src/logger";
import { SocketContext } from "../../SocketContext";

export function useItems(itemKeys) {
  logger.log('useItems', itemKeys);

  const socket = useContext(SocketContext);

  const itemsRef = useRef({ itemKeys });
  itemsRef.current = {
    itemKeys,
    data: {},
    broadcasted: {},
    subscriptions: {}
  };

  const formMethods = useForm();
  itemsRef.current.formMethods = formMethods;

  itemsRef.current.getData = (name) => {
    logger.log('getData', name, itemsRef.current.data?.[name]);
    return itemsRef.current.data?.[name];
  };

  itemsRef.current.getNestedData = (name) => {
    // logger.log('getNestedData', name, itemsRef.current.data)
    const nestedData = {};
    Object.keys(itemsRef.current.data)
      .filter((dataKey) => dataKey.startsWith(name))
      .map(dataKey => nestedData[dataKey] = itemsRef.current.data[dataKey]);
    return nestedData;
  };

  itemsRef.current.broadcast = (valueKey, event, value) => {
    logger.log('broadcast', valueKey, event.type, event?.target?.value, value);

    const itemKey = valueKey.split('.')[0];

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

    runSubscriptions(itemsRef.current.subscriptions, itemsRef.current.data, valueKey, newValue);

    itemsRef.current.data[valueKey] = newValue;
    itemsRef.current.broadcasted[valueKey] = newValue;

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

  itemsRef.current.subscribe = (valueKey, callback) => {
    // itemsRef.current.subscriptions[valueKey] = callback
    if (itemsRef.current.subscriptions[valueKey] === undefined) {
      itemsRef.current.subscriptions[valueKey] = [];
    }
    itemsRef.current.subscriptions[valueKey].push(callback);
  };

  function runSubscriptions(subscriptions, data, valueKey, value) {
    logger.log('runSubscriptions', 'subscriptions:', subscriptions, 'valueKey:', valueKey, 'value:', value, 'data:', data);
    // if (subscriptions.hasOwnProperty(valueKey)) {
    // const callback = subscriptions[valueKey]
    // callback(valueKey, value)
    // }
    // else {
    Object.keys(subscriptions).map(subscriptionKey => {
      if (subscriptionKey === valueKey) {
        // const callback = subscriptions[valueKey]
        // callback(valueKey, value)
        const callbacks = subscriptions[valueKey];
        callbacks?.map(callback => callback(valueKey, value));
      }
      else if (valueKey.startsWith(subscriptionKey)) {
        const nestedDataKeys = {};
        Object.keys(data)
          .filter((dataKey) => dataKey.startsWith(subscriptionKey))
          .map(dataKey => nestedDataKeys[dataKey] = data[dataKey]);
        logger.log('runSubscriptions nestedData', subscriptionKey, valueKey, nestedDataKeys);
        if (nestedDataKeys.length === 0 || !nestedDataKeys.hasOwnProperty(valueKey)) {
          // an item was updated
          // const callback = subscriptions[subscriptionKey]
          // callback(valueKey, value)
          const callbacks = subscriptions[subscriptionKey];
          callbacks?.map(callback => callback(valueKey, value));
        }
        else {
          // a new item was added
        }
      }
    });

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
        socket?.emit('get-items', data);
        logger.log('useItems socket emit get-items', data);
      });
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

  function handleReceiveAllItems(data) {
    logger.log('handleReceiveAllItems socket', data);

    const newData = {};
    Object.keys(data).map(itemKey => {
      data[itemKey].map(item => {
        const valueKey = item.valueKey;
        const value = item.value;
        const broadcastedValue = itemsRef.current.broadcasted[valueKey];
        if (broadcastedValue === undefined) {
          newData[valueKey] = value;
          const { setValue } = itemsRef.current.formMethods;
          setValue(valueKey, value);
          runSubscriptions(itemsRef.current.subscriptions, itemsRef.current.data, valueKey, value);
        }
        else if (broadcastedValue === value) {
          delete itemsRef.current.broadcasted[valueKey];
          runSubscriptions(itemsRef.current.subscriptions, itemsRef.current.data, valueKey, value);
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
    logger.log('handleReceiveAllItems newData', itemsRef.current.data);
  }

  return itemsRef.current;
}
