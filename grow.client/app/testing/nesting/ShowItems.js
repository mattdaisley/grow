'use client';

import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";

import logger from "../../../../grow.api/src/logger";
import { ShowCollection } from "./ShowCollection";
import { FieldWrapper, FieldItem, ControlledField, ChildrenWithProps } from "./FieldItem";
import { itemTypes } from "./constants";
import { useSubscription } from "./useSubscription";

export function ShowItems({ searchSuffix, ...props }) {

  const { name, fields } = useSubscription({ searchSuffix, ...props });

  logger.log('ShowItems', 'itemKey:', props.itemKey, 'fields:', fields, 'props:', props);

  if (Object.keys(fields).length === 0) {
    return null;
  }

  return (
    <ShowControls {...props} name={name} fields={fields} />
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

  return (
    <>
      {Object.keys(fields).map(fieldKey => {

        const keyPrefix = `${name}.${fieldKey}`;
        const valueKeys = fields[fieldKey];

        logger.log('ShowControls rendering', 'fieldKey:', fieldKey, 'valueKeys:', valueKeys);

        const ShowControl = getShowControl(props.itemKey);

        if (ShowControl === null) {
          return null;
          // use below to debug missing properties
          // return (
          //   <div key={fieldKey}>
          //     {props.itemKey}: <TextField fullWidth multiline value={JSON.stringify(valueKeys, null, 2)} />
          //   </div>
          // )
        }

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
  const { fields: widthFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'width' });
  const { fields: typeFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' });

  logger.log('ShowSection', 'typeField:', typeFields, 'widthFields:', widthFields, 'props:', props);

  const width = Number(widthFields.width) || 12;

  return (
    <Grid xs={width} alignContent={'flex-start'}>
      <Paper sx={{ width: '100%' }}>
        {(typeFields?.type === undefined) && (
          <Grid container spacing={1} xs={12} sx={{ py: 1, px: 2 }}>
            <ShowItem {...props} />
          </Grid>
        )}
        {(typeFields.type !== undefined) && (
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
  const searchSuffix = 'width';
  const { name: widthName, fields: widthFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix });

  logger.log('ShowGroup', 'widthName:', widthName, 'widthFields:', widthFields, 'props:', props);

  return (
    <Grid xs={Number(widthFields?.width) ?? 12} sx={{ mt: 1 }}>
      <ShowItem {...props} />
    </Grid>
  );
}
function ShowField(props) {
  logger.log('ShowField', 'props:', props);

  return (
    <>
      {props.valueKeys.hasOwnProperty('type')
        ? <ShowFieldControl {...props} itemKey={`${props.itemKey}.${props.fieldKey}`} keyPrefix={undefined} searchSuffix={undefined} />
        : <ShowItem {...props} />}


    </>
  );
}
function ShowFieldControl(props) {
  const itemKey = `${props.itemKey}`;
  const keyPrefix = undefined;

  const { name: typeName, fields: typeFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' });
  const { name: nameName, fields: nameFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'name' });
  const { name: labelName, fields: labelFields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: `label` });
  logger.log('ShowFieldControl', 'nameName:', nameName, 'nameFields:', nameFields, 'labelName:', labelName, 'labelFields:', labelFields, 'props:', props);

  if (Object.keys(typeFields).length === 0 || Object.keys(labelFields).length === 0) {
    return null;
  }

  const controllerName = `${props.contextValueKeyPrefix}.${nameFields.name}`;
  const label = labelFields.label ?? nameFields.name;

  return (
    <FieldWrapper>
      <FieldItem
        {...props}
        name={controllerName}
        render={(nextProps) => {
          return <ControlledField {...nextProps} type={typeFields.type} label={label} />;
        }} />
    </FieldWrapper>
  );
}

export function ShowItem({ children, keyPrefix, fieldKey, valueKeys, ...props }) {
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
  const { fields } = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix });

  logger.log('ItemLabel', 'labelFields:', fields, 'props:', props);

  if (fields?.label === undefined || fields.label === "") {
    return null;
  }

  return (
    <Grid xs={12} sx={{ mb: -1 }}>
      <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'grey.300', px: 1 }}>{fields.label}</Typography>
    </Grid>
  );
}
function ShowReferencedItem({ valueKeys, ...props }) {
  logger.log('ShowReferencedItem', 'valueKeys:', valueKeys, 'props:', props);

  if (valueKeys !== null && valueKeys?.id !== undefined) {
    return <ShowItems {...props} keyPrefix={undefined} searchSuffix={valueKeys.id} />;
  }
  return null;
}
function ShowItemProperties({ valueKeys, fieldKey, children, ...props }) {
  logger.log('ShowItemProperties', 'valueKeys:', valueKeys, 'fieldKey:', fieldKey, 'props:', props);

  if (valueKeys !== null && valueKeys?.id === undefined) {
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
