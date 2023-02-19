'use client'

import useFields from '../hooks/useFields';
import usePages from '../hooks/usePages';
import useViews from "../hooks/useViews";
import { AdminEditPage } from "../components/AdminEditPage";
import logger from '../../../../grow.api/src/logger';

export default function AdminPagesPage() {

  const dynamicItemsName = "Admin"

  const { allPages, addItems: addPageItems, setItems: setPagesItems } = usePages()
  const { allViews, addItems: addViewItems, setItems: setViewsItems } = useViews()
  const { allFields, addItems: addFieldItems, setItems: setFieldsItems } = useFields()
  logger.log(allPages, allViews, allFields)

  if (allPages?.item === undefined || allViews?.item === undefined || allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }
  const dynamicFormData = { currentPage: { name: "Pages" }, timestamp: Date.now(), json: allPages.json, data: allPages.item }

  const actions = {
    setItems: (newItems) => {
      logger.log('setItems:', newItems)
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
    onAddItems: (addedItems) => {
      logger.log('onAddItems:', addedItems)

      const addedPageItems = addedItems.filter(item => item.prefix.split('.')[0] === 'pages');
      addPageItems(addedPageItems)

      const addedViewItems = addedItems.filter(item => item.prefix.split('.')[0] === 'views');
      addViewItems(addedViewItems)

      const addedFieldItems = addedItems.filter(item => item.prefix.split('.')[0] === 'fields');
      addFieldItems(addedFieldItems)
    },
    onDeleteItem: (name) => {
      logger.log('onDeleteItem:', name)
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
