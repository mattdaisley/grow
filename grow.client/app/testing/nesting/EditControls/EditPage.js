'use client';
import logger from "../../../../services/logger";
import { EditItem } from "./EditItem";

export function EditPage(props) {
  logger.log('EditPage', 'props:', props);
  return (
    <>
      <EditItem {...props} contextKey="pages" />
    </>
  );
}
