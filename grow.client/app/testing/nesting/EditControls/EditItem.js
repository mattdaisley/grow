'use client';

import { unflatten } from "flat";

import Box from "@mui/material/Box";

import logger from "../../../../services/logger";
import { itemTypes } from "../constants";
import { EditItems } from "../EditItems/EditItems";
import { EditReferencedItem } from "./EditReferencedItem";
import { EditItemProperties } from "../EditItems/EditItemProperties";

export function EditItem({ children, fieldKey, ...props }) {

  const nestedItems = unflatten(props.itemsMethods.getNestedDataObject(props.keyPrefix));

  logger.log('EditItem', 'itemKey:', props.itemKey, 'keyPrefix:', props.keyPrefix, 'fieldKey:', fieldKey, 'nestedItems:', nestedItems, 'props:', props);

  const missingNestedItems = getMissingNestedItems({ itemKey: props.itemKey, valueKeys: nestedItems });
  const valueKeys = {
    ...nestedItems,
    ...missingNestedItems
  };

  return (
    <>
      <EditReferencedItem {...props} valueKeys={valueKeys} />

      <EditItemProperties {...props} valueKeys={valueKeys} fieldKey={fieldKey}>
        {children}
        <EditNestedItems {...props} valueKeys={valueKeys} />
      </EditItemProperties>

    </>
  );
}

export function getMissingNestedItems({ itemKey, valueKeys }) {
  switch (itemKey) {
    case 'apps':
      if (!valueKeys.hasOwnProperty('pages')) {
        return { ...valueKeys, pages: {} };
      }
      break;
    case 'sections':
      if (!valueKeys.hasOwnProperty('views')) {
        return { ...valueKeys, views: {} };
      }
      break;
    case 'groups':
      if (!valueKeys.hasOwnProperty('fields')) {
        return { ...valueKeys, fields: {} };
      }
      break;
    default:
      break;
  }

  return {};
}

export function EditNestedItems({ valueKeys, keyPrefix, ...props }) {
  logger.log('EditNestedItems', 'valueKeys:', valueKeys, 'keyPrefix:', keyPrefix, 'props:', props);

  return (
    <>
      {valueKeys !== null && Object.keys(valueKeys).map(itemKey => {
        if (itemTypes.includes(itemKey) === false) {
          return null;
        }

        return (
          <Box key={itemKey} sx={{ mt: 1, flexGrow: 1, border: 1, borderRadius: 1, borderColor: 'grey.300' }}>
            <EditItems {...props} keyPrefix={keyPrefix} itemKey={itemKey} referenceValueKey={undefined} />
          </Box>
        );
      })}

      {/* {!valueKeys.hasOwnProperty('sections') && (
                          <AddNewItemControl {...props} />
                        )} */}
    </>
  );
}
