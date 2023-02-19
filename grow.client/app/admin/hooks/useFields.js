'use client'

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import logger from '../../../../grow.api/src/logger';

import useItems from './useItems';

const defaultFields = () => ({
  fields: {
    [uuidv4()]: {
      name: "example_text",
      type: "text",
      props: {
        label: "Example Text Field"
      },
    }
  }
})

export default function useFields() {

  const [allFields, setAllFields] = useState();

  const fieldsItems = useItems('allfields', { onSuccess: handleSocketSuccess });

  function handleSocketSuccess(data) {
    logger.log('useFields.handleSocketSuccess', data)
    if (Object.keys(data.item).length === 0) {
      const nextItem = defaultFields()
      logger.log(nextItem);
      fieldsItems.setItems(nextItem)
    }
    else {
      setAllFields(data);
    }
  }
  logger.log('useFields', allFields);

  return {
    allFields,
    addItems: fieldsItems.addItems,
    setItems: fieldsItems.setItems,
    deleteItems: fieldsItems.deleteItems
  }
}