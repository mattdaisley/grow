'use client';
import logger from "../../../../services/logger";
import { EditFieldTypeProperty, EditAutocompleteFieldOptionsProperty } from "../EditItems/EditItemProperties";
import { EditItem } from "./EditItem";

export function EditField(props) {
  logger.log('EditField', 'props:', props);
  return (
    <EditItem {...props} contextKey="fields">
      <EditFieldTypeProperty controllerName={`${props.keyPrefix}.type`} label="Type" />
      <EditAutocompleteFieldOptionsProperty />
    </EditItem>
  );
}
