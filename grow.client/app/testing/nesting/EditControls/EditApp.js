'use client';

import { unflatten } from "flat";

import { EditReferencedItem } from "./EditReferencedItem";
import { getMissingNestedItems } from "./EditItem";

export function EditApp({ children, fieldKey, ...props }) {

  const nestedItems = unflatten(props.itemsMethods.getNestedDataObject(props.keyPrefix));

  console.log('EditApp', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'fieldKey:', fieldKey, 'nestedItems:', nestedItems, 'props:', props);

  const missingNestedItems = getMissingNestedItems({ itemKey: props.itemKey, valueKeys: nestedItems });
  const valueKeys = {
    ...nestedItems,
    ...missingNestedItems
  };

  return (
    <>
      <EditReferencedItem {...props} contextKey="apps" valueKeys={valueKeys} />
    </>
  );
  // logger.log('EditApp', 'props:', props);
  // return (
  //   <>
  //     <EditItem {...props} contextKey="pages" />
  //   </>
  // );
}
