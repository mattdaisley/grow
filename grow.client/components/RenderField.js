'use client'

import { AutocompleteItem } from './AutocompleteItem';
import { CheckboxItem } from './CheckboxItem';
import { LabelItem } from './LabelItem';
import { SelectItem } from './SelectItem';
import { TextItem } from './TextItem';

export const RenderField = ({ field, control, fieldArrayName }) => {
  // console.log(field);
  const getItem = () => {
    switch (field.type) {
      case 'text':
      case 'numeric':
        return TextItem;
      case 'autocomplete':
        return AutocompleteItem;
      case 'checkbox':
        return CheckboxItem;
      case 'select':
        return SelectItem;
      case 'label':
        return LabelItem;
      default:
        // Do nothing for an unsupported type
        return undefined;
    }
  };

  const FieldItem = getItem();

  if (!FieldItem) {
    return null;
  }

  return <FieldItem appField={field} control={control} fieldArrayName={fieldArrayName} />;

};
