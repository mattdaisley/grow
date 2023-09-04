'use client';
import logger from "../../../../services/logger";
import { EditCollectionExternalSource } from "../EditItems/EditItemProperties";
import { EditItem } from "./EditItem";

export function EditCollection(props) {
  logger.log('EditCollection', 'props:', props);
  return (
    <EditItem {...props} contextKey="collections">
      <EditCollectionExternalSource />
    </EditItem>
  );
}
