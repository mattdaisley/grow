'use client';

import logger from "../../../../services/logger";

import { useSubscription } from "../useSubscription";
import { EditControls } from "../EditControls/EditControls";
import { AddItemActions } from "./AddItemActions";
import { AddNewItemControl } from "./AddNewItemControl";
import { AddExistingItemControl } from "./AddExistingItemControl";

export function EditItems({ fieldsControlsPrefix, searchSuffix, ...props }) {

  let { contextKey, keyPrefix, itemKey } = props;
  let searchKeyPrefix = keyPrefix
  let searchItemsKey = itemKey
  let noItemsKeyPrefix = keyPrefix
  let noItemsKey = itemKey
  if (['apps'].includes(contextKey)) {
    // searchKeyPrefix = contextKey
    searchItemsKey = `${itemKey}.${searchSuffix}`

    noItemsKeyPrefix = `${contextKey}.${itemKey}`
    noItemsKey = 'pages'
  }

  const fields = useSubscription({ ...props, keyPrefix: searchKeyPrefix, itemKey: searchItemsKey, searchSuffix: undefined });

  let name = keyPrefix === undefined ? searchItemsKey : `${keyPrefix}.${itemKey}`;

  console.log('EditItems', 'itemKey:', itemKey, 'keyPrefix:', keyPrefix, 'fields:', fields, 'props:', props, 'fields:', fields);

  if (fields === undefined || fields.size === 0) {
    logger.log('EditItems fields not set')
    return (
      <>
        <AddItemActions {...props} keyPrefix={noItemsKeyPrefix} itemKey={noItemsKey} fields={fields}>
          <AddExistingItemControl />
          <AddNewItemControl />
        </AddItemActions>
      </>
    );
  }

  const fieldsControls = {}
  if (fieldsControlsPrefix) {
    fieldsControls[fieldsControlsPrefix] = {}
  }
  fields.forEach((values, fieldKey) => {
    if (fieldsControlsPrefix) {
      fieldsControls[fieldsControlsPrefix][fieldKey] = values
    }
    else {
      fieldsControls[fieldKey] = values
    }
  })

  return (
    <EditControls {...props} name={name} fields={fieldsControls} />
  );
}

