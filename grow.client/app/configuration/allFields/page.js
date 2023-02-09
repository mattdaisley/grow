'use client'

import { v4 as uuidv4 } from 'uuid';

import useStorage from '../../../services/useStorage';
import { DynamicFieldsForm } from '../DynamicFieldsForm';
import { getAllFieldsDynamicFormData } from './getAllFieldsDynamicFormData';

export default function AllFieldsPage() {

  const allFields = useStorage('allfields');
  // console.log(allFields);

  if (allFields.requestState === 'no-results') {
    allFields.setItem({
      fields: [{
        id: uuidv4(),
        name: "example_text",
        type: "text",
        props: {
          label: "Example Text Field"
        },
      }]
    })
  }

  if (allFields?.item === undefined) {
    return null;
  }

  if (allFields?.item === null) {
    return <div>Unable to load items</div>;
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

