'use client';

import { useMemo } from "react";


import { getDynamicFormDefaults as getDynamicFormData } from "../getDynamicFormDefaults";
import { DynamicFields } from "../DynamicFields";
import { DynamicAppBar } from "../DynamicAppBar";
import { DynamicForm } from "../DynamicForm";

export function DynamicItemForm(props) {

  const dynamicFormData = useMemo(() => getDynamicFormData(props), [
    props.dynamicItem.timestamp,
    props.allPages.timestamp,
    props.allViews.timestamp,
    props.allFields.timestamp
  ]);

  // const { currentPageDefinition, currentPageFieldDefaults } = usePages(props.pageId);
  // console.log(props.pageId, currentPageFieldDefaults)

  // console.log(dynamicFormData)
  // console.log(formState.isDirty)
  // console.log(formState.isDirty, formMethods.getValues(), formState.dirtyFields)

  function onSubmit(data) {
    // console.log('onSubmit', data)
    // display form data on success
    props.dynamicItem.setItem(data)
    // setFormResults(JSON.stringify(data, null, 4));
  }

  return (
    <>
      <DynamicAppBar dynamicItem={props.dynamicItem} dynamicFormData={dynamicFormData} />
      <DynamicForm {...props} dynamicFormData={dynamicFormData} onSubmit={onSubmit}>
        <DynamicFields currentPage={dynamicFormData.currentPage} />
      </DynamicForm>
    </>
  );
}



