'use client'

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import useItems from './useItems';

const defaultPages = () => ({
  Pages: {
    [uuidv4()]: {
      name: "Example Page",
      groups: {
        [uuidv4()]: {
          label: "",
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
    console.log('usePages.handleSocketSuccess', data)
    if (Object.keys(data.item).length === 0) {
      pagesItems.setItems(defaultPages())
    }
    else {
      setAllPages(data);
    }
  }
  console.log('usePages', allPages);

  return {
    allPages
  }
}