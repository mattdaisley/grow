import { TextItem } from './TextItem';
import { AutocompleteItem } from './AutocompleteItem';
import { CheckboxItem } from './CheckboxItem';
import { SelectItem } from './SelectItem';

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
      default:
        // Do nothing for an unsupported type
        break;
    }
  };

  const FieldItem = getItem();

  return <FieldItem appField={field} key={field.id} control={control} fieldArrayName={fieldArrayName} />;

};
