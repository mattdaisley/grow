'use client';

import { Fragment } from "react";

import Divider from '@mui/material/Divider';

import logger from "../../../../services/logger";
import { AddCollectionItemControl } from "../EditItems/AddCollectionItemControl";
import { AddExistingItemControl } from "../EditItems/AddExistingItemControl";
import { AddNewItemControl } from "../EditItems/AddNewItemControl";
import { AddItemActions } from "../EditItems/AddItemActions";
import { EditPage } from "./EditPage";
import { EditCollection } from "./EditCollection";
import { EditSection } from "./EditSection";
import { EditView } from "./EditView";
import { EditGroup } from "./EditGroup";
import { EditField } from "./EditField";
import { EditApp } from "./EditApp";

export function EditControls({ name, fields, ...props }) {
  console.log('EditControls', 'name:', name, 'contextKey:', props.contextKey, 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props);

  const itemKey = props.itemKey;

  let EditControl = null;
  switch (itemKey) {
    case 'apps':
      EditControl = EditApp;
      break;
    case 'pages':
      EditControl = EditPage;
      break;
    case 'collections':
      EditControl = EditCollection;
      break;
    case 'sections':
      EditControl = EditSection;
      break;
    case 'groups':
      EditControl = EditGroup;
      break;
    case 'views':
      EditControl = EditView;
      break;
    case 'fields':
      EditControl = EditField;
      break;
  }

  return (
    <>
      {Object.keys(fields).map(fieldKey => {
        const keyPrefix = `${name}.${fieldKey}`;
        const valueKeys = fields[fieldKey];

        if (EditControl === null) {
          logger.log('EditControl not set', 'itemKey:', itemKey);
          return null;
          // use below to debug missing properties
          // return (
          //   <div key={fieldKey}>
          //     {props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(valueKeys, null, 2)} />
          //   </div>
          // )
        }

        logger.log('EditControls rendering', 'fieldKey:', fieldKey, 'keyPrefix:', keyPrefix, 'valueKeys:', valueKeys);
        return (
          <Fragment key={fieldKey}>
            <EditControl {...props} keyPrefix={keyPrefix} fieldKey={fieldKey} valueKeys={valueKeys} />
            <Divider />
          </Fragment>
        );
      })}

      {['pages'].includes(itemKey) && (
        <AddItemActions {...props} fields={fields}>
          <AddExistingItemControl />
          <AddNewItemControl />
        </AddItemActions>
      )}

      {['groups', 'collections'].includes(itemKey) && (
        <AddItemActions {...props} fields={fields}>
          <AddNewItemControl />
        </AddItemActions>
      )}

      {['sections'].includes(itemKey) && (
        <AddItemActions {...props} fields={fields}>
          <AddNewItemControl />
          <AddCollectionItemControl />
        </AddItemActions>
      )}

      {['views', 'fields'].includes(itemKey) && (name !== itemKey) && (
        <AddItemActions {...props} fields={fields}>
          <AddExistingItemControl />
          <AddNewItemControl />
        </AddItemActions>
      )}
    </>
  );
}


