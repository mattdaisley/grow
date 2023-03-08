'use client'

import useFields from '../hooks/useFields';
import usePages from '../hooks/usePages';
import useViews from "../hooks/useViews";
import { AdminEditPage } from "../components/AdminEditPage";
import logger from '../../../services/logger';
import useDynamicItems from '../hooks/useDynamicItems';

export default function AdminPagesPage() {

  const dynamicItemsName = "Admin"
  const dynamicItemsKey = 'editor'

  const { allItems: allDynamicItems, addItems: addDynamicItems, setItems: setDynamicItems, deleteItems: deleteDynamicItems, register: registerDynamic } = useDynamicItems(dynamicItemsKey)
  const { allPages, addItems: addPageItems, setItems: setPagesItems, deleteItems: deletePagesItems } = usePages()
  const { allViews, addItems: addViewItems, setItems: setViewsItems, deleteItems: deleteViewsItems } = useViews()
  const { allFields, addItems: addFieldItems, setItems: setFieldsItems, deleteItems: deleteFieldsItems } = useFields()
  logger.log('AdminPagesPage', allDynamicItems, allPages, allViews, allFields)

  if (allDynamicItems?.item === undefined || allPages?.item === undefined || allViews?.item === undefined || allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }
  const dynamicFormData = { currentPage: { name: "Pages" }, timestamp: Date.now(), json: allPages.json + allDynamicItems.json, data: allPages.item, dynamicData: allDynamicItems.flattened }

  const actions = {
    setItems: (newItems) => {
      logger.log('setItems:', newItems)

      if (newItems.hasOwnProperty(dynamicItemsKey)) {
        setDynamicItems({ [dynamicItemsKey]: newItems[dynamicItemsKey] })
      }

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

      const addedDynamicItems = addedItems.filter(item => item.prefix.split('.')[0] === dynamicItemsKey);
      addDynamicItems(addedDynamicItems)

      const addedPageItems = addedItems.filter(item => item.prefix.split('.')[0] === 'pages');
      addPageItems(addedPageItems)

      const addedViewItems = addedItems.filter(item => item.prefix.split('.')[0] === 'views');
      addViewItems(addedViewItems)

      const addedFieldItems = addedItems.filter(item => item.prefix.split('.')[0] === 'fields');
      addFieldItems(addedFieldItems)
    },
    onDeleteItem: (deletedItems) => {
      logger.log('onDeleteItem:', deletedItems)

      const deletedDynamicItems = deletedItems.filter(item => item.prefix.split('.')[0] === dynamicItemsKey);
      deleteDynamicItems(deletedDynamicItems)

      const deletedPagesItems = deletedItems.filter(item => item.prefix.split('.')[0] === 'pages');
      deletePagesItems(deletedPagesItems)

      const deletedViewsItems = deletedItems.filter(item => item.prefix.split('.')[0] === 'views');
      deleteViewsItems(deletedViewsItems)

      const deletedFieldsItems = deletedItems.filter(item => item.prefix.split('.')[0] === 'fields');
      deleteFieldsItems(deletedFieldsItems)
    },
    onFieldChange: (name, onChangeCallback) => {
      // console.log('onFieldChange register', name)

      let setItems
      let register

      const nameContext = name.split('.')[0]
      switch (nameContext) {
        case dynamicItemsKey:
          setItems = setDynamicItems;
          register = registerDynamic;
          break;
        case 'pages':
          setItems = setPagesItems;
          break;
        case 'views':
          setItems = setViewsItems;
          break;
        case 'fields':
          setItems = setFieldsItems;
          break;
      }

      return (event, value) => {
        console.log('onFieldChange', event, value)
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

        register && register(name, onChangeCallback, Date.now())
        setItems && setItems({ [name]: newValue })
        onChangeCallback && onChangeCallback(event, value)
      }
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
