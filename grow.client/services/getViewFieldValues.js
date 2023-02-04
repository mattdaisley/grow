import { v4 as uuidv4 } from 'uuid';

import { getFieldValues } from './getFieldValues';

export function getViewFieldValues(view) {
  // console.log(view)
  let viewFields = [];
  let viewFieldValues = { id: uuidv4() }
  view?.groups?.map(group => {

    const groupFields = getFieldValues(group.fields);
    // console.log(groupFields)
    viewFields = [...viewFields, ...groupFields.viewFields]
    viewFieldValues = { ...viewFieldValues, ...groupFields.viewFieldValues }
  });

  // console.log(viewFields, viewFieldValues)
  return { viewFields, viewFieldValues };
}