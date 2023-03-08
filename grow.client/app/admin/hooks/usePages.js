'use client'

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import logger from '../../../services/logger';

import useItems from './useItems';

const defaultPages = () => ({
  pages: {
    [uuidv4()]: {
      label: "Example Page",
      name: "example_page",
      sections: {
        [uuidv4()]: {
          label: "Example Section",
          name: "example_section",
          width: "12",
        }
      }
    }
  }
})

export default function usePages() {

  const [allPages, setAllPages] = useState();

  const pagesItems = useItems('allpages', { onSuccess: handleSocketSuccess });

  function handleSocketSuccess(data) {
    logger.log('usePages.handleSocketSuccess', data)
    if (Object.keys(data.item).length === 0) {
      pagesItems.setItems(defaultPages())
    }
    else {
      setAllPages(data);
    }
  }
  logger.log('usePages', allPages, pagesItems);

  return {
    allPages,
    addItems: pagesItems.addItems,
    setItems: pagesItems.setItems,
    deleteItems: pagesItems.deleteItems
  }
}