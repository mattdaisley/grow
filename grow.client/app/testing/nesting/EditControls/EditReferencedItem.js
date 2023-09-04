'use client';

import logger from "../../../../services/logger";

import { EditItems } from "../EditItems/EditItems";

export function EditReferencedItem({ valueKeys, ...props }) {

  console.log('EditReferencedItem', 'valueKeys:', valueKeys, 'props:', props);

  // const id = valueKeys instanceof Map ? valueKeys.get('id') : (Object.keys(valueKeys).length > 0 ? Object.values(valueKeys)[0].id : valueKeys?.id)
  const id = valueKeys instanceof Map ? valueKeys.get('id') : (valueKeys?.id ?? (Object.keys(valueKeys).length > 0 ? Object.values(valueKeys)[0].id : undefined));
  // const id = valueKeys instanceof Map ? valueKeys.get('id') : valueKeys?.id
  logger.log('EditReferencedItem', 'id:', id);

  if (id !== undefined) {
    return (
      <EditItems
        {...props}
        keyPrefix={undefined}
        searchSuffix={id}
        fieldsControlsPrefix={id}
        referenceValueKey={props.keyPrefix} />
    );
  }
  return null;
}
