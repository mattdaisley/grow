import { getViewFieldValues } from './getViewFieldValues';

export function getCollectionFieldDefaults(group) {

  let collectionName = group.name ?? "collection";
  let collection = {};

  group.views?.map(view => {
    let viewFieldValues = getViewFieldValues(view);
    collection = { ...collection, ...viewFieldValues }
  });

  return { collectionName, collection };
}


