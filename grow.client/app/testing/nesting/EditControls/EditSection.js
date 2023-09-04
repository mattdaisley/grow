'use client';
import logger from "../../../../services/logger";
import { useSubscription } from "../useSubscription";
import { EditProperty, EditCollectionTypeProperty, EditReferencedCollectionProperty, EditCollectionSortOrderProperty, EditCollectionXAxisProperty } from "../EditItems/EditItemProperties";
import { EditItem } from "./EditItem";

export function EditSection(props) {
  const itemKey = `${props.keyPrefix}`;
  const keyPrefix = undefined;
  const typeField = useSubscription({ ...props, itemKey, keyPrefix, searchSuffix: 'type' });

  logger.log('EditSection', 'typeField:', typeField, 'props:', props);

  return (
    <EditItem {...props} contextKey="pages">
      <EditProperty controllerName={`${props.keyPrefix}.width`} label="Width" />
      {typeField !== undefined && (
        <EditCollectionTypeProperty controllerName={`${props.keyPrefix}.type`} label="Type" />
      )}
      {typeField !== undefined && (
        <EditReferencedCollectionProperty />
      )}
      {typeField === '1' && (
        <EditCollectionSortOrderProperty controllerName={`${props.keyPrefix}.sort-order`} label="Sort Order" />
      )}
      {typeField === '3' && (
        <EditCollectionXAxisProperty controllerName={`${props.keyPrefix}.group-by`} label="Group By" />
      )}
      {typeField === '3' && (
        <EditCollectionXAxisProperty controllerName={`${props.keyPrefix}.x-axis`} label="X Axis" />
      )}
      {/* {typeField === '3' && (
                    <EditCollectionXAxisProperty controllerName={`${props.keyPrefix}.x-axis-label`} label="X Axis Label" />
                  )} */}
      {typeField === '3' && (
        <EditCollectionXAxisProperty controllerName={`${props.keyPrefix}.y-axis`} label="Y Axis" />
      )}
    </EditItem>
  );
}
