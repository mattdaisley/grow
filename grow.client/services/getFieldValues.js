import { getFieldDefault } from './getFieldDefault';

export function getFieldValues(fields) {
  let viewFields = [];
  let viewFieldValues = {};

  fields?.map((fieldDefinition) => {
    if (fieldDefinition) {
      // console.log(fieldDefinition)
      const fieldDefault = getFieldDefault(fieldDefinition);
      // console.log(fieldDefinition, fieldDefault)
      viewFields.push({ ...fieldDefinition, default: fieldDefault });
      viewFieldValues[fieldDefinition.name] = fieldDefault;
    }
  });
  // console.log(viewFields, viewFieldValues)
  return { viewFields, viewFieldValues };
}
