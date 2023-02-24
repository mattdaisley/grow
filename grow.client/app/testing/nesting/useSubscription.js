'use client';

import { useRef, useState, useEffect } from "react";
import { unflatten } from 'flat';

import logger from "../../../../grow.api/src/logger";

export function useSubscription(props) {

  const [fields, setFields] = useState({});
  const _fieldsRef = useRef({});

  let name = props.keyPrefix === undefined ? props.itemKey : `${props.keyPrefix}.${props.itemKey}`;
  let searchName = props.searchSuffix === undefined ? name : `${name}.${props.searchSuffix}`;

  logger.log('useSubscription', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'searchSuffix:', props.searchSuffix, 'name:', name, 'searchName:', searchName, 'props:', props);

  useEffect(() => {

    const callback = (valueKey, value) => {
      logger.log('useSubscription subscribed change', searchName, valueKey, value);
      const trimmedKey = valueKey.substring(name.length + 1, valueKey.length);
      updateFields(_fieldsRef, { ..._fieldsRef.current, [trimmedKey]: value }, setFields);
    };

    props.subscribe(searchName, callback);

    const nestedData = props.getNestedData(searchName);
    const newFields = {};
    Object.keys(nestedData).map(nestedDataKey => {
      const trimmedKey = nestedDataKey.substring(name.length + 1, nestedDataKey.length);
      newFields[trimmedKey] = nestedData[nestedDataKey];
    });

    updateFields(_fieldsRef, newFields, setFields);
    logger.log('useSubscription useEffect', 'name:', name, 'newFields:', newFields, 'nestedData:', nestedData);

    return () => {
      props.unsubscribe(searchName, callback);
    };
  }, [name, searchName]);

  return {
    name,
    fields
  };
}

function updateFields(_ref, newFields, setFunc) {
  if (_ref?.current !== undefined) {
    _ref.current = newFields;
    setFunc(unflatten(_ref.current, { object: true }));
  }
}
