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
      deps={[allFields.timestamp]}
      {...allFields} />
  )
}

