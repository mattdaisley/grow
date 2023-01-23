import { getFieldDefault } from './getFieldDefault';

export function getViewFieldValues(view) {
  let viewFieldValues = {};
  view?.groups?.map(group => {

    group.fields?.map((fieldDefinition) => {
      if (fieldDefinition) {
        const { key, defaultValue } = getFieldDefault(fieldDefinition);
        viewFieldValues[key] = defaultValue;
      }
    });
  });
  return viewFieldValues;
}
