'use client'


import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';

import useFields from '../hooks/useFields';
import usePages from '../hooks/usePages';
import useViews from "../hooks/useViews";
import { AdminEditPage } from "../components/AdminEditPage";

export default function AdminPagesPage() {

  const dynamicItemsName = "Admin"

  const { allPages, addItem: addPageItem, setItems: setPagesItems } = usePages()
  const { allViews, addItem: addViewItem, setItems: setViewsItems } = useViews()
  const { allFields, addItem: addFieldItem, setItems: setFieldsItems } = useFields()
  console.log(allPages, allViews, allFields)

  if (allPages?.item === undefined || allViews?.item === undefined || allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }
  const dynamicFormData = { currentPage: { name: "Pages" }, timestamp: Date.now(), data: allPages.item }

  const actions = {
    setItems: (newItems) => {
      console.log('setItems:', newItems)
      const pagesKey = 'pages'
      if (newItems.hasOwnProperty(pagesKey)) {
        setPagesItems({ [pagesKey]: newItems[pagesKey] })
      }

      const viewsKey = 'views'
      if (newItems.hasOwnProperty(viewsKey)) {
        setViewsItems({ [viewsKey]: newItems[viewsKey] })
      }

      const fieldsKey = 'fields'
      if (newItems.hasOwnProperty(fieldsKey)) {
        setFieldsItems({ [fieldsKey]: newItems[fieldsKey] })
      }
    },
    onAddItem: (prefix, suffix, value) => {
      console.log('onAddItem:', prefix, suffix, value)
      if (prefix.split('.')[0] === 'pages') {
        addPageItem(prefix, suffix, value)
      }
      if (prefix.split('.')[0] === 'views') {
        addViewItem(prefix, suffix, value)
      }
      if (prefix.split('.')[0] === 'fields') {
        addFieldItem(prefix, suffix, value)
      }
    },
    onDeleteItem: (name) => {
      console.log('onDeleteItem:', name)
    }
  }

  // const dynamicItem = { item: { name: "Configuration" } };
  return (
    <AdminEditPage
      dynamicItem={dynamicItem}
      dynamicFormData={dynamicFormData}
      allViews={allViews.item.views}
      allFields={allFields.item.fields}
      actions={actions}
      onSubmit={() => { }}
    />
  )
}
