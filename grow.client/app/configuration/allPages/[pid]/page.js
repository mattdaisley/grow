'use client'

import { v4 as uuidv4 } from 'uuid';

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

  function handleAddGroup() {
    const newAllPages = allPages.item.pages?.map(page => {
      if (page.id === pageId) {

        const newId = uuidv4();
        const newGroups = [...page.groups, { id: newId, views: [] }]
        return { ...page, groups: [...newGroups] };
      }

      return page;
    })
    // console.log({ pages: newAllPages })
    allPages.setItem({ pages: newAllPages })
  }

  function handleDeleteGroup(groupId) {
    const newAllPages = allPages.item.pages?.map(page => {
      if (page.id === pageId) {
        const newGroups = page.groups.filter(group => group.id !== groupId)
        return { ...page, groups: [...newGroups] };
      }

      return page;
    })
    // console.log({ pages: newAllPages })
    allPages.setItem({ pages: newAllPages })
  }

  function handleAddView(groupId, viewId) {
    // console.log(groupId, viewId)
    const newAllPages = allPages.item.pages?.map(page => {
      if (page.id === pageId) {
        const newGroups = page.groups.map(group => {
          if (group.id === groupId) {
            return { ...group, views: [...group.views, { viewId }] }
          }
          return group;
        })

        return { ...page, groups: [...newGroups] };
      }

      return page;
    })
    // console.log({ pages: newAllPages })
    allPages.setItem({ pages: newAllPages })
  }

  function handleRemoveView(groupId, viewId) {
    console.log(groupId, viewId)
    const newAllPages = allPages.item.pages?.map(page => {
      if (page.id === pageId) {
        const newGroups = page.groups.map(group => {
          if (group.id === groupId) {
            const newViews = group.views.filter(view => view.viewId !== viewId)
            return { ...group, views: newViews }
          }
          return group;
        })

        return { ...page, groups: [...newGroups] };
      }

      return page;
    })
    // console.log({ pages: newAllPages })
    allPages.setItem({ pages: newAllPages })
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
      onAddGroup={handleAddGroup}
      onDeleteGroup={handleDeleteGroup}
      onAddView={handleAddView}
      onRemoveView={handleRemoveView}
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

