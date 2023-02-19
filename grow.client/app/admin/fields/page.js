'use client'

import useFields from '../hooks/useFields';
import { AdminEditPage } from "../components/AdminEditPage";
import logger from '../../../../grow.api/src/logger';

export default function AdminFieldsPage() {

  const dynamicItemsName = "Admin"

  const { allFields, addItems: addFieldItems, setItems: setFieldsItems, deleteItems: deleteFieldItems } = useFields()
  logger.log('AdminFieldsPage', allFields)

  if (allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }
  const dynamicFormData = { currentPage: { name: "Fields" }, timestamp: Date.now(), json: allFields.json, data: allFields.item }

  const actions = {
    setItems: (newItems) => {
      logger.log('AdminFieldsPage setItems:', newItems)
      const fieldsKey = 'fields'
      if (newItems.hasOwnProperty(fieldsKey)) {
        // setFieldsItems({ [fieldsKey]: newItems[fieldsKey] })
      }
    },
    onAddItems: (addedItems) => {
      logger.log('onAddItems:', addedItems)

      const addedFieldItems = addedItems.filter(item => item.prefix.split('.')[0] === 'fields');
      addFieldItems(addedFieldItems)
    },
    onDeleteItems: (deletedItems) => {
      logger.log('onDeleteItems:', deletedItems)
      // if (name.split('.')[0] === 'fields') {
      deleteFieldItems(deletedItems)
      // }
    }
  }

  // const dynamicItem = { item: { name: "Configuration" } };
  return (
    <AdminEditPage dynamicItem={dynamicItem} dynamicFormData={dynamicFormData} actions={actions} onSubmit={() => { }} />
  )
}
