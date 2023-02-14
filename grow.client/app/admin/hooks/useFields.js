'use client'

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

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
    console.log('useFields.handleSocketSuccess', data)
    if (Object.keys(data.item).length === 0) {
      const nextItem = defaultFields()
      console.log(nextItem);
      fieldsItems.setItems(nextItem)
    }
    else if (Object.keys(data.item.fields).length === 1) {
      const nextItem = defaultFields()
      const newItems = { fields: { ...data.item.fields, ...nextItem.fields } };
      console.log(newItems);
      fieldsItems.setItems(newItems)
    }
    else {
      setAllFields(data);
    }
  }
  console.log('useFields', allFields);

  return {
    allFields,
    addItem: fieldsItems.addItem,
    setItems: fieldsItems.setItems
  }
}