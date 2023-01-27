import { v4 as uuidv4 } from 'uuid';

import { getFieldDefault } from './getFieldDefault';

export function getViewFieldValues(view) {
  let viewFields = [];
  let viewFieldValues = { id: uuidv4() }
  view?.groups?.map(group => {

    group.fields?.map((fieldDefinition) => {
      if (fieldDefinition) {
        const fieldDefault = getFieldDefault(fieldDefinition);
        // console.log(viewField)
        viewFields.push({ ...fieldDefinition, default: fieldDefault });
        viewFieldValues[fieldDefinition.name] = fieldDefault;
      }
    });
  });

  return { viewFields, viewFieldValues };
}
