'use client'

import { AutocompleteItem } from '../Elements/AutocompleteItem';
import { CheckboxItem } from '../Elements/CheckboxItem';
import { LabelItem } from '../Elements/LabelItem';
import { SelectItem } from '../Elements/SelectItem';
import { TextItem } from '../Elements/TextItem';

export const RenderField = ({ field, control, fieldArrayName }) => {
  // console.log(field?.name);
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
