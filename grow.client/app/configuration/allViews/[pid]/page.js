'use client'

import { v4 as uuidv4 } from 'uuid';

import useStorage from '../../../../services/useStorage';
import { DynamicFieldsForm } from '../../DynamicFieldsForm';
import { getViewFieldValues } from '../../../../services/getViewFieldValues';
// import { getDynamicFormDefaults as getDynamicFormData } from "../../../[dynamic]/getDynamicFormDefaults";

// import { getAllPagesDynamicFormData } from './getAllPagesDynamicFormData';

function getAllViewsDynamicFormData(props) {
  // console.log('getAllViewsDynamicFormData')
  const allViews = props.allViews.item.views || [];
  const view = allViews.find(x => x.id === props.pageId);

  const allFields = props.allFields.item.fields || [];

  // const fields = getFieldValues(allFields.item.fields);
  // console.log(view)
  const viewGroups = view?.groups?.map(group => {

    const groupFields = group.fields?.map((groupField) => {

      const field = allFields.find(x => x.id === groupField.fieldId);

      const filledField = { ...field };
      // console.log(field, groupField)
      if (groupField.conditions) {
        filledField.conditions = [...groupField.conditions];
      }
      // console.log(filledField, field)
      return filledField;
    });
    // console.log(group.fields, groupFields)
    return { label: '', ...group, fields: groupFields };
  });

  const { viewFieldValues } = getViewFieldValues(view, allFields);

  // console.log(fields)
  const dynamicFormData = {
    currentPage: {
      name: view.name,
      groups: [
        {
          id: 0,
          views: [
            {
              ...view,
              groups: viewGroups
            }
          ]
        }
      ]
    },
    fieldValues: { ...viewFieldValues },
    timestamp: Date.now()
  };
  // console.log(dynamicFormData)
  return dynamicFormData;
}

function setDynamicFormData(newValue, setItem) {
  // console.log(newValue, setItem)

  const newGroups = newValue.groups.map(group => {

    const newViews = group.views.map(view => {

      const newViewGroups = view.groups.map(viewGroup => {
        // console.log(viewGroup)
        const newFields = viewGroup.fields.map(field => ({ fieldId: field.id ?? field.fieldId }))
        return { ...viewGroup, fields: newFields }
      })

      return { ...view, groups: newViewGroups }
    })

    return { ...group, views: newViews }
  })

  // console.log({ ...newValue, groups: newGroups })
  setItem({ ...newValue, groups: newGroups })
}

export default function EditViewPage({ params }) {

  const dynamicItemsName = "Configuration / Views"
  const id = 0
  const viewId = Number(params.pid)

  const allViews = useStorage('allviews');
  const allFields = useStorage('allfields');

  // const dynamicItem = useStorage(`${dynamicItemsName}-${id}`);
  const dynamicItem = { item: { name: dynamicItemsName }, timestamp: Date.now(), setItem: () => { } }

  // console.log(allPages, allViews, allFields, dynamicItem)

  if (!allViews?.item || !allFields?.item) {
    return null;
  }

  // console.log(allPages, allViews, allFields, dynamicItem)
  let view = allViews.item.views?.find(x => x.id === viewId);
  if (view === undefined) {
    view = { id: viewId, name: `view ${viewId}`, groups: [{ id: 0, fields: [] }] }
    allViews.item.views.push(view)
  }
  const json = JSON.stringify(view, null, 2);

  function handleSetItem(newItem) {
    // console.log(newItem)
    try {
      let newView
      if (typeof newItem !== 'string') {
        // console.log(newItem);
        newView = newItem.groups[0].views[0]
      }
      else {
        newView = JSON.parse(newItem);
      }
      // console.log(newItem, newView, allViews)
      const newAllViews = allViews.item.views?.map(view => {
        if (view.id === viewId) {
          return newView;
        }
        return view;
      })
      // console.log({ views: newAllViews })
      allViews.setItem({ views: newAllViews })
    }
    catch (e) {
      if (e instanceof SyntaxError) {
        // SyntaxErrors are expected and can be ignored
      } else {
        console.log(e)
      }
    }
  }

  function handleAddViewGroup() {
    const newAllViews = allViews.item.views?.map(view => {
      if (view.id !== viewId) {
        return view;
      }

      const newId = uuidv4();
      const newViewGroups = [...view.groups, { id: newId, fields: [] }]

      return { ...view, groups: newViewGroups }
    })
    // console.log({ views: newAllViews })
    allViews.setItem({ views: newAllViews })
  }

  function handleDeleteViewGroup(viewGroupId) {
    const newAllViews = allViews.item.views?.map(view => {
      if (view.id !== viewId) {
        return view;
      }

      const newViewGroups = view.groups.filter(viewGroup => viewGroup.id !== viewGroupId);

      return { ...view, groups: newViewGroups }
    })
    // console.log({ views: newAllViews })
    allViews.setItem({ views: newAllViews })
  }

  function handleAddField(viewGroupId, fieldId) {
    // console.log(viewId, viewGroupId, fieldId)

    const newAllViews = allViews.item.views?.map(view => {
      if (view.id !== viewId) {
        return view;
      }

      const newViewGroups = view.groups.map(viewGroup => {
        if (viewGroup.id !== viewGroupId) {
          return viewGroup;
        }

        return { ...viewGroup, fields: [...viewGroup.fields, { fieldId }] };
      })

      return { ...view, groups: newViewGroups }
    })
    // console.log({ views: newAllViews })
    allViews.setItem({ views: newAllViews })
  }

  function handleRemoveField(viewGroupId, fieldId) {
    // console.log(viewGroupId, fieldId)

    const newAllViews = allViews.item.views?.map(view => {
      if (view.id !== viewId) {
        return view;
      }

      const newViewGroups = view.groups.map(viewGroup => {
        if (viewGroup.id !== viewGroupId) {
          return viewGroup;
        }

        const newFields = viewGroup.fields.filter(field => field.fieldId !== fieldId);
        return { ...viewGroup, fields: newFields };
      })

      return { ...view, groups: newViewGroups }
    })
    // console.log({ views: newAllViews })
    allViews.setItem({ views: newAllViews })
  }

  return (
    <DynamicFieldsForm
      editorLevel="view"
      id={id}
      pageId={viewId}
      allViews={allViews}
      allFields={allFields}
      dynamicItem={dynamicItem}
      getDynamicFormData={getAllViewsDynamicFormData}
      setDynamicFormData={setDynamicFormData}
      deps={[allViews.timestamp, allFields.timestamp]}
      json={json}
      setItem={handleSetItem}
      onAddViewGroup={handleAddViewGroup}
      onDeleteViewGroup={handleDeleteViewGroup}
      onAddField={handleAddField}
      onRemoveField={handleRemoveField} />
  )
}

