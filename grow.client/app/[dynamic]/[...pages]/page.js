'use client'

import { TextField } from "@mui/material";
import { usePathname } from "next/navigation"
import { useContext, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import usePages from "../../../services/pages.service";
import useStorage from "../../../services/useStorage";
import { DynamicItemContext as DynamicPageContext } from "./DynamicItemContext";
import { getDynamicFormDefaults } from "./getDynamicFormDefaults";

export default function DynamicPage() {
  const pathname = usePathname();
  const pathnameKeys = pathname.split('/');

  const dynamicItemsName = pathnameKeys[1]
  const id = Number(pathnameKeys[2])
  const pageId = Number(pathnameKeys[3])

  const allPages = useStorage('allpages');
  const allViews = useStorage('allviews');
  const allFields = useStorage('allfields');
  const dynamicItem = useStorage(`${dynamicItemsName}-${id}`);

  // console.log(allPages, allViews, allFields, dynamicItem)

  if (!allPages?.item || !allViews?.item || !allFields?.item) {
    return <div>Unable to load configuration data</div>;
  }

  if (!dynamicItem?.item) {
    return <div>{dynamicItemsName} {id} not found</div>;
  }

  // console.log(allPages, allViews, allFields, dynamicItem)

  return (
    <DynamicForm
      id={id}
      pageId={pageId}
      dynamicItemsName={dynamicItemsName}
      dynamicItem={dynamicItem}
      allPages={allPages}
      allViews={allViews}
      allFields={allFields}
    />
  )
}

function DynamicForm(props) {
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const formDefaults = useMemo(() => getDynamicFormDefaults(props), [
    props.dynamicItem.timestamp,
    props.allPages.timestamp,
    props.allViews.timestamp,
    props.allFields.timestamp
  ])

  // const { currentPageDefinition, currentPageFieldDefaults } = usePages(props.pageId);
  // console.log(props.pageId, currentPageFieldDefaults)

  const formMethods = useForm(formDefaults.fieldValues);

  useEffect(() => {
    if (!isFirstLoad) {
      formMethods.reset({ ...formDefaults });
    }

    setIsFirstLoad(false)
  }, [isFirstLoad, formDefaults.timestamp])

  return (
    <FormProvider {...formMethods}>
      <DynamicPageContext.Provider value={{ ...props }}>
        <DynamicFields />
      </DynamicPageContext.Provider>
    </FormProvider>
  )
}

function DynamicFields() {
  const dynamicPageData = useContext(DynamicPageContext)

  const formMethods = useFormContext()
  const fields = formMethods.watch()

  // console.log(dynamicPageData);

  return (
    <div>
      <TextField
        id="form-results"
        multiline
        fullWidth
        maxRows={35}
        value={JSON.stringify(fields, null, 2)}
        InputProps={{
          readOnly: true,
        }}
      />
    </div>
  );
}