'use client'

import useFields from '../hooks/useFields';
import { AdminEditPage } from "../components/AdminEditPage";

export default function AdminFieldsPage() {

  const dynamicItemsName = "Admin"

  const { allFields, addItem: addFieldItem, setItems: setFieldsItems } = useFields()
  console.log('AdminFieldsPage', allFields)

  if (allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }
  const dynamicFormData = { currentPage: { name: "Fields" }, timestamp: Date.now(), data: allFields.item }

  const actions = {
    setItems: setFieldsItems,
    onAddItem: (prefix, suffix, value) => {
      console.log('onAddItem:', prefix, suffix, value)
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
    <AdminEditPage dynamicItem={dynamicItem} dynamicFormData={dynamicFormData} actions={actions} onSubmit={() => { }} />
  )
}
