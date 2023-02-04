'use client'

import useStorage from '../../../../services/useStorage';
import { DynamicFieldsForm } from '../../DynamicFieldsForm';
import { getDynamicFormDefaults as getDynamicFormData } from "../../../[dynamic]/getDynamicFormDefaults";

// import { getAllPagesDynamicFormData } from './getAllPagesDynamicFormData';

export default function EditPagePage({ params }) {

  const dynamicItemsName = "Configuration / Pages"
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
  let page = allPages.item.pages?.find(x => x.id === pageId);
  if (page === undefined) {
    page = { id: pageId, name: `page ${pageId}`, groups: [{ id: 0, views: [] }] }
    allPages.item.pages.push(page)
  }
  const json = JSON.stringify(page, null, 2);

  function handleSetItem(newPage) {
    try {
      // console.log(newPage)
      const newAllPages = allPages.item.pages?.map(page => {
        if (page.id === newPage.id) {
          return newPage;
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
      editorLevel="page"
      id={id}
      pageId={pageId}
      dynamicItem={dynamicItem}
      getDynamicFormData={getDynamicFormData}
      setDynamicFormData={setDynamicFormData}
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


function setDynamicFormData(newValue, setItem) {
  // console.log(newValue)

  const newGroups = newValue.groups.map(group => {

    const newViews = group.views.map(view => {
      return { viewId: view.id }
    })

    return { ...group, views: newViews }
  })

  // console.log({ ...newValue, groups: newGroups })
  setItem({ ...newValue, groups: newGroups })
}

