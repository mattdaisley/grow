'use client'

import useStorage from '../../../../services/useStorage';
import { DynamicFieldsForm } from '../../DynamicFieldsForm';
import { DynamicItemForm } from '../../../[dynamic]/[...pages]/DynamicItemForm'
import { getDynamicFormDefaults as getDynamicFormData } from "../../../[dynamic]/getDynamicFormDefaults";

// import { getAllPagesDynamicFormData } from './getAllPagesDynamicFormData';
import { getAllFieldsDynamicFormData } from '../../allFields/getAllFieldsDynamicFormData';

export default function EditPagePage({ params }) {

  const dynamicItemsName = "configuration"
  const id = 0
  const pageId = Number(params.pid)

  const allPages = useStorage('allpages');
  const allViews = useStorage('allviews');
  const allFields = useStorage('allfields');
  // const dynamicItem = useStorage(`${dynamicItemsName}-${id}`);
  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }

  // console.log(allPages, allViews, allFields, dynamicItem)

  if (!allPages?.item || !allViews?.item || !allFields?.item) {
    return null;
  }

  if (!dynamicItem?.item) {
    return <div>{dynamicItemsName} {id} not found</div>;
  }

  // console.log(allPages, allViews, allFields, dynamicItem)
  const page = allPages.item.pages?.find(x => x.id === pageId);
  const json = JSON.stringify(page, null, 2);

  function handleSetItem(rawJson) {
    try {
      var parsedJson = JSON.parse(rawJson);
      const newAllPages = allPages.item.pages?.map(page => {
        if (page.id === pageId) {
          return parsedJson;
        }
        return page;
      })
      // console.log({ pages: newAllPages })
      allPages.setItem({ pages: newAllPages })
    }
    catch (e) {
      if (e instanceof SyntaxError) {
        // SyntaxErrors are expected and can be ignored
      } else {
        console.log(e)
      }
    }
  }

  return (
    <DynamicFieldsForm
      id={id}
      pageId={pageId}
      dynamicItem={dynamicItem}
      getDynamicFormData={getDynamicFormData}
      deps={[allPages.timestamp, allViews.timestamp, allFields.timestamp]}
      json={json}
      setItem={handleSetItem}
      allPages={allPages}
      allViews={allViews}
      allFields={allFields} />

    // <DynamicItemForm
    //   id={id}
    //   pageId={pageId}
    //   dynamicItemsName={dynamicItemsName}
    //   dynamicItem={dynamicItem}
    //   allPages={allPages}
    //   allViews={allViews}
    //   allFields={allFields}
    // />
  )
}

