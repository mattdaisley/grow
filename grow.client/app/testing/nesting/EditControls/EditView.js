'use client';
import logger from "../../../../services/logger";
import { EditItem } from "./EditItem";

export function EditView(props) {
  logger.log('EditView', 'props:', props);
  return (
    <EditItem {...props} contextKey="views" />
  );
}
