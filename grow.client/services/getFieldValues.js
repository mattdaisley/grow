import { getFieldDefault } from './getFieldDefault';

export function getFieldValues(fields, allFields) {
  let viewFields = [];
  let viewFieldValues = {};

  fields?.map((field) => {
    if (field) {
      let fieldDefinition
      let fieldDefault
      // console.log(allFields, field)
      if (field.fieldId !== undefined) {
        // assume this is a field defined in a view and not the full field definition so look it up
        fieldDefinition = allFields.find(f => f.id === field.fieldId);
        // console.log(fieldDefinition)
        fieldDefault = getFieldDefault(fieldDefinition)
      }
      else {
        // assume the field already has the full field definition
        fieldDefinition = field;
        fieldDefault = getFieldDefault(field);
      }
      // console.log(fieldDefinition, fieldDefault)
      viewFields.push({ ...field, default: fieldDefault });
      viewFieldValues[fieldDefinition.name] = fieldDefault;
    }
  });
  // console.log(viewFields, viewFieldValues)
  return { viewFields, viewFieldValues };
}
