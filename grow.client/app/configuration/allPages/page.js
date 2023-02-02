'use client'

import useStorage from '../../../services/useStorage';
import { DynamicFieldsForm } from '../DynamicFieldsForm';

import { getAllPagesDynamicFormData } from './getAllPagesDynamicFormData';

export default function AllPagesPage() {

  const allPages = useStorage('allpages');
  console.log(allPages);

  if (allPages?.item === undefined) {
    return null;
  }

  const dynamicItem = { item: { name: "configuration" } };

  return <DynamicFieldsForm dynamicItem={dynamicItem} getDynamicFormData={getAllPagesDynamicFormData} {...allPages} />
}

