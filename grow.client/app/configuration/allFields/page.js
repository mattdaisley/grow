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

  return (
    <DynamicFieldsForm
      dynamicItem={dynamicItem}
      getDynamicFormData={getAllFieldsDynamicFormData}
      setDynamicFormData={setDynamicFormData}
      deps={[allFields.timestamp]}
      {...allFields} />
  )
}

function setDynamicFormData(newValue, setItem) {
  console.log(newValue)

  const fields = [...newValue.groups[0].views[0].groups[0].fields]
  // console.log(fields, setItem)
  setItem({ fields })
}

