'use client'

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import logger from '../../../services/logger';

import useItems from './useItems';

const defaultViews = () => ({
  views: {
    [uuidv4()]: {
      label: "Example View",
      name: "example_view",
      groups: {
        [uuidv4()]: {
          label: "Example Group",
          name: "example_group",
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
    logger.log('useViews.handleSocketSuccess', data)
    if (Object.keys(data.item).length === 0) {
      viewsItems.setItems(defaultViews())
    }
    else {
      setAllViews(data);
    }
  }
  logger.log('useViews', allViews);

  return {
    allViews,
    addItems: viewsItems.addItems,
    setItems: viewsItems.setItems,
    deleteItems: viewsItems.deleteItems
  }
}