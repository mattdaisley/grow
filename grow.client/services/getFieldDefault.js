export function getFieldDefault(fieldDefinition) {
  // console.log("allFields", allFieldsDefinition, field);
  // console.log(fieldDefinition);
  let defaultValue = undefined;

  switch (fieldDefinition.type) {
    case 'text':
    case 'select':
    case 'numeric':
      defaultValue = '';
      break;
    case 'autocomplete':
      defaultValue = null;
      break;
    case 'checkbox':
      defaultValue = false;
      break;
    default:
      // Do nothing for an unsupported type
      break;
  }

  return defaultValue;
  // console.log(key, fieldValues[key], fieldDefinition);

}
