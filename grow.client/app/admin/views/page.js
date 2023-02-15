'use client'

import useViews from '../hooks/useViews';
import useFields from '../hooks/useFields';
import { AdminEditPage } from "../components/AdminEditPage";

export default function AdminViewsPage() {

  const dynamicItemsName = "Admin"

  const { allViews, addItem: addViewItem, setItems: setViewsItems } = useViews()
  const { allFields, addItem: addFieldItem, setItems: setFieldsItems } = useFields()
  console.log(allViews, allFields)

  if (allViews?.item === undefined || allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }
  const dynamicFormData = { currentPage: { name: "Views" }, timestamp: Date.now(), json: allViews.json, data: allViews.item }

  const actions = {
    setItems: (newItems) => {
      console.log('setItems:', newItems)

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
      allFields={allFields.item.fields}
      actions={actions}
      onSubmit={() => { }}
    />
  )
}