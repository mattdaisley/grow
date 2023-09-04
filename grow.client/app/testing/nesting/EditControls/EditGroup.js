'use client';
import logger from "../../../../services/logger";
import { EditProperty } from "../EditItems/EditItemProperties";
import { EditItem } from "./EditItem";

export function EditGroup(props) {
  logger.log('EditGroup', 'props:', props);
  return (
    <EditItem {...props} contextKey="views">
      <EditProperty controllerName={`${props.keyPrefix}.width`} label="Width" />
    </EditItem>
  );
}
