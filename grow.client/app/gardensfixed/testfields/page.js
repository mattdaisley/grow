'use client'

import { memo, useEffect, useState } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"

import { getFieldDefault } from "../../../services/getFieldDefault"
import useFields from "../../../services/useFields"
import useStorage from "../../../services/useStorage"

export default function Page() {
  const fieldArrayName = 'testfields'

  const { item: allPages, timestamp: pagesTimestamp } = useStorage('allpages');
  const { item: allViews, timestamp: viewsTimestamp } = useStorage('allviews');
  const { item: allFields, timestamp: fieldsTimestamp } = useStorage('allfields');

  console.log(allPages, allViews, allFields)

  return (
    <DynamicForm
      fieldArrayName={fieldArrayName}
      allPages={allPages?.pages}
      pagesTimestamp={pagesTimestamp}
      allViews={allViews?.views}
      viewsTimestamp={viewsTimestamp}
      allFields={allFields?.fields}
      fieldsTimestamp={fieldsTimestamp}
    />
  )
}

function DynamicForm(props) {
  if (props.allPages === undefined) {
    return;
  }
  if (props.allViews === undefined) {
    return;
  }
  if (props.allFields === undefined) {
    return;
  }

  return <TestForm {...props} />
}

function getFieldValues(allFields) {
  let fieldValues = {};

  allFields.map(field => {
    // console.log(fieldDefinition);
    const fieldDefault = getFieldDefault(field)
    fieldValues[field.name] = fieldDefault;
  })

  // console.log("getFieldValues", allFields, fieldValues);
  return [fieldValues];
}

function TestForm({ fieldArrayName, allFields, fieldsTimestamp, children }) {
  const [count, setCount] = useState(0)
  const [resetTimestamp, setResetTimestamp] = useState(Date.now())

  const formMethods = useForm({ [fieldArrayName]: getFieldValues(allFields) });

  // console.log(formMethods, allFields)

  useEffect(() => {

    formMethods.reset({ [fieldArrayName]: getFieldValues(allFields) });
    setResetTimestamp(Date.now())
    console.log("resetting form", fieldsTimestamp, allFields)

  }, [fieldsTimestamp])

  return (
    <FormProvider {...formMethods} >
      <div>{count}</div>
      <NestedFormContainer resetTimestamp={resetTimestamp} field="testfields.0.test__text1" />
      <NestedFormContainer resetTimestamp={resetTimestamp} field="testfields.0.test__text1" />
      <button onClick={() => setCount(count + 1)}>count++</button>
    </FormProvider>
  )

}

function NestedFormContainer(props) {
  const methods = useFormContext();
  // console.log("nestedformcontainer", props)
  return <NestedInput {...props} formMethods={methods} field={props.field} />
}

const NestedInput = ({ formMethods: { register, watch, formState: { isDirty } }, field }) => {
  const fields = watch();
  // console.log(fields);
  return <input {...register(field)} />;
};