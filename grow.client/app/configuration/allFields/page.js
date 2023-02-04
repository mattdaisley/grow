'use client'

import useStorage from '../../../services/useStorage';
import { DynamicFieldsForm } from '../DynamicFieldsForm';

import { getAllFieldsDynamicFormData } from './getAllFieldsDynamicFormData';

export default function AllFieldsPage() {

  const allFields = useStorage('allfields');
  // console.log(allFields);

  if (allFields?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: "Configuration" } };

  function handleDeleteField(fieldId) {
    // console.log(fieldId)
    const newFields = allFields.item.fields.filter(field => field.id !== fieldId)
    // console.log(newFields, allFields.item)
    allFields.setItem({ fields: [...newFields] })
  }

  return (
    <DynamicFieldsForm
      dynamicItem={dynamicItem}
      getDynamicFormData={getAllFieldsDynamicFormData}
      setDynamicFormData={setDynamicFormData}
      deps={[allFields.timestamp]}
      onDeleteField={handleDeleteField}
      {...allFields} />
  )
}

function setDynamicFormData(newValue, setItem) {
  // console.log(newValue)

  const fields = [...newValue.groups[0].views[0].groups[0].fields]
  // console.log(fields, setItem)
  setItem({ fields })
}

