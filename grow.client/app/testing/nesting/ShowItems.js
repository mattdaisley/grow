'use client';

import { useMemo } from 'react';
import { unflatten } from "flat";

import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";

import logger from "../../../../grow.api/src/logger";
import { ShowCollection } from "./ShowCollection";
import { FieldWrapper, FieldItem, ControlledField, ChildrenWithProps } from "./FieldItem";
import { itemTypes } from "./constants";
import { useSubscription } from "./useSubscription";

export function ShowItems({ fieldsControlsPrefix, searchSuffix, filter, ...props }) {

  const fields = useSubscription({ searchSuffix, filter, ...props });

  let name = props.keyPrefix === undefined ? props.itemKey : `${props.keyPrefix}.${props.itemKey}`;

  logger.log('ShowItems', 'itemKey:', props.itemKey, 'fieldsControlsPrefix:', fieldsControlsPrefix, 'searchSuffix:', searchSuffix, 'fields:', fields, 'props:', props);

  if (fields === undefined || fields.size === 0) {
    logger.log('ShowItems fields not set')
    return null;
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
    <ShowControls {...props} name={name} fields={fieldsControls} />
  );
}

function ShowControls({ name, fields, ...props }) {
  logger.log('ShowControls', 'name:', name, 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props);

  function getShowControl(itemKey) {
    switch (itemKey) {
      case 'pages':
        return ShowPage;
      case 'sections':
        return ShowSection;
      case 'groups':
        return ShowGroup;
      case 'views':
        return ShowView;
      case 'fields':
        return ShowField;
      default:
        return null;
    }
  }

  const ShowControl = getShowControl(props.itemKey);

  return (
    <>
      {Object.keys(fields).map(fieldKey => {

        const keyPrefix = `${name}.${fieldKey}`;
        const valueKeys = fields[fieldKey];

        if (ShowControl === null) {
          return null;
          // use below to debug missing properties
          // return (
          //   <div key={fieldKey}>
          //     {props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(valueKeys, null, 2)} />
          //   </div>
          // )
        }

        logger.log('ShowControls rendering', 'fieldKey:', fieldKey, 'keyPrefix:', keyPrefix, 'valueKeys:', valueKeys);
        return <ShowControl key={fieldKey} {...props} keyPrefix={keyPrefix} fieldKey={fieldKey} valueKeys={valueKeys} />;
      })}
    </>
  );
}
function ShowPage(props) {

  logger.log('ShowPage', 'props:', props);

  return (
    <>
      <ShowItemLabel {...props} />
      <ShowItem {...props} />
    </>
  );
}
function ShowSection(props) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const widthField = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'width' })
  const typeField = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' })

  logger.log('ShowSection', 'widthField:', widthField, 'typeField:', typeField, 'props:', props);

  const width = Number(widthField) || 12;

  return (
    <Grid xs={width} alignContent={'flex-start'}>
      <Paper sx={{ width: '100%' }}>
        {(typeField === undefined) && (
          <Grid container spacing={1} xs={12} sx={{ py: 1, px: 2 }}>
            <ShowItem {...props} />
          </Grid>
        )}
        {(typeField !== undefined) && (
          <ShowCollection {...props} />
        )}
      </Paper>
    </Grid>
  );
}

function ShowView(props) {
  logger.log('ShowView', 'props:', props);

  return (
    <>
      <ShowItemLabel {...props} />
      <ShowItem {...props} />
    </>
  );
}

function ShowGroup(props) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const widthField = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'width' })

  logger.log('ShowGroup', 'widthField:', widthField, 'props:', props);

  const width = Number(widthField) || 12;

  return (
    <Grid xs={width} sx={{ mt: 1 }}>
      <ShowItem {...props} />
    </Grid>
  );
}

function ShowField(props) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const typeField = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' })

  logger.log('ShowField', 'typeField:', typeField, 'props:', props);

  return (
    <>
      {typeField !== undefined
        ? <ShowFieldControl {...props} itemKey={`${props.itemKey}.${props.fieldKey}`} keyPrefix={undefined} searchSuffix={undefined} />
        : <ShowItem {...props} />}
    </>
  );
}

function ShowFieldControl(props) {
  const itemKey = `${props.itemKey}`;
  const keyPrefix = undefined;
  const type = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' });
  const name = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'name' });
  const label = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: `label` });

  logger.log('ShowFieldControl', 'type:', type, 'name:', name, 'label:', label, 'props:', props);

  if (type === undefined) {
    return null;
  }

  const controllerName = `${props.contextValueKeyPrefix}.${name}`;
  const fieldLabel = label ?? name;

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledField {...nextProps} type={type} label={fieldLabel} />;
        }} />
    </FieldWrapper>
  );
}

export function ShowItem({ children, keyPrefix, fieldKey, ...props }) {

  const valueKeys = unflatten(props.itemsMethods.getNestedDataObject(keyPrefix))

  logger.log('ShowItem', 'itemKey:', props.itemKey, 'keyPrefix:', keyPrefix, 'fieldKey:', fieldKey, 'valueKeys:', valueKeys, 'props:', props);

  return (
    <>
      <ShowReferencedItem {...props} valueKeys={valueKeys} />
      <ShowItemProperties {...props} valueKeys={valueKeys} fieldKey={fieldKey}>
        {children}
      </ShowItemProperties>

      <ShowNestedItems {...props} valueKeys={valueKeys} keyPrefix={keyPrefix} />
    </>
  );
}

function ShowItemLabel(props) {
  const itemKey = `${props.itemKey}.${props.fieldKey}`;
  const keyPrefix = undefined;
  const searchSuffix = 'label';
  const label = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix });

  logger.log('ShowItemLabel', 'label:', label, 'props:', props);

  if (label === undefined || label === "") {
    return null;
  }

  return (
    <Grid xs={12} sx={{ mb: -1 }}>
      {props.contextKey === 'preview' && (
        <Typography variant="subtitle2" sx={{ px: 1 }}>
          {props.fieldKey}
        </Typography>
      )}
      <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'grey.300', px: 1 }}>
        {label}
      </Typography>
    </Grid>
  );
}

function ShowReferencedItem({ valueKeys, ...props }) {
  logger.log('ShowReferencedItem', 'valueKeys:', valueKeys, 'props:', props);

  const id = valueKeys instanceof Map ? valueKeys.get('id') : valueKeys?.id
  if (id !== undefined) {
    return (
      <ShowItems
        {...props}
        keyPrefix={undefined}
        searchSuffix={valueKeys.id}
        fieldsControlsPrefix={id}
      />
    )
  }
  return null;
}

function ShowItemProperties({ valueKeys, fieldKey, children, ...props }) {
  logger.log('ShowItemProperties', 'valueKeys:', valueKeys, 'fieldKey:', fieldKey, 'props:', props);

  const id = valueKeys instanceof Map ? valueKeys.get('id') : valueKeys?.id
  if (id === undefined) {
    return (
      <>
        <ChildrenWithProps {...props}>
          {children}
        </ChildrenWithProps>
      </>
    );
  }

  return null;
}

function ShowNestedItems({ valueKeys, keyPrefix, ...props }) {
  return (
    <>
      {valueKeys !== null && Object.keys(valueKeys).map(valueKey => {
        logger.log('ShowNestedItems nested', 'keyPrefix:', keyPrefix, 'valueKey:', valueKey);
        if (itemTypes.includes(valueKey) === false) {
          return null;
        }

        return (
          <ShowItems key={valueKey} {...props} keyPrefix={keyPrefix} itemKey={valueKey} />
        );
      })}
    </>
  );
}
