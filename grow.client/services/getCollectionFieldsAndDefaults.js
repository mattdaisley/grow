import { v4 as uuidv4 } from 'uuid';

import { getViewFieldValues } from './getViewFieldValues';

export function getCollectionFieldsAndDefaults(group) {

  let collectionName = group.name ?? "collection";
  let collection = [];
  let fieldValues = { id: uuidv4() };

  group.views?.map(view => {
    const { viewFields, viewFieldValues } = getViewFieldValues(view);

    viewFields.map(viewField => {
      const key = viewField.name;
      // console.log(key, fieldValues);
      if (!(key in fieldValues)) {
        collection.push(viewField)
        fieldValues[key] = viewFieldValues[key]
      }
    })

  });
  // console.log(collection, fieldValues)

  return { collectionName, collection, fieldValues };
}


