'use client'

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import useItems from './useItems';

const defaultViews = () => ({
  views: {
    [uuidv4()]: {
      name: "Example View",
      groups: {
        [uuidv4()]: {
          label: "",
          width: "12",
        }
      }
    }
  }
})

export default function useViews() {

  const [allViews, setAllViews] = useState();

  const viewsItems = useItems('allviews', { onSuccess: handleSocketSuccess });

  function handleSocketSuccess(data) {
    console.log('useViews.handleSocketSuccess', data)
    if (Object.keys(data.item).length === 0) {
      viewsItems.setItems(defaultViews())
    }
    else {
      setAllViews(data);
    }
  }
  console.log('useViews', allViews);

  return {
    allViews,
    addItem: viewsItems.addItem,
    setItems: viewsItems.setItems
  }
}