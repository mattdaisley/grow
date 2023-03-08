'use client'

import useFields from '../hooks/useFields';
import { AdminEditPage } from "../components/AdminEditPage";
import logger from '../../../services/logger';

export default function AdminFieldsPage() {

  const dynamicItemsName = "Admin"

  const { allFields, addItems: addFieldItems, setItems: setFieldsItems, deleteItems: deleteFieldsItems } = useFields()
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
    onDeleteItem: (deletedItems) => {
      logger.log('onDeleteItem:', deletedItems)

      const deletedFieldsItems = deletedItems.filter(item => item.prefix.split('.')[0] === 'fields');
      deleteFieldsItems(deletedFieldsItems)
    },
    onFieldChange: (name, onChangeCallback) => {
      let setItems

      const nameContext = name.split('.')[0]
      switch (nameContext) {
        case 'fields':
          setItems = setFieldsItems;
          break;
      }

      // logger.log('onFieldChange', name)
      return (event, value) => {
        let newValue
        switch (event.type) {
          case 'click':
            logger.log('onFieldChange click', name, value);
            newValue = value;
            break;
          case 'change':
          default:
            logger.log('onFieldChange change', name, event.target.value);
            newValue = event.target.value;
            break;
        }

        setItems && setItems({ [name]: newValue })
        onChangeCallback && onChangeCallback(event, value)
      }
    }
  }

  // const dynamicItem = { item: { name: "Configuration" } };
  return (
    <AdminEditPage dynamicItem={dynamicItem} dynamicFormData={dynamicFormData} actions={actions} onSubmit={() => { }} />
  )
}
