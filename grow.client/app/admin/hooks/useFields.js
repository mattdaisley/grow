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
      fieldsItems.setItems(defaultFields())
    }
    else {
      setAllFields(data);
    }
  }
  console.log('useFields', allFields);

  return {
    allFields
  }
}