'use client';
import { ViewGroupItems } from '../ViewGroupItems/ViewGroupItems';

export function ViewItems({ groupId, view, viewControlName, control, openField, onClick, onNewFieldClick }) {

  return view.groups?.map((viewGroup, viewGroupIndex) => {
    const viewGroupControlName = `${viewControlName}.groups.${viewGroupIndex}`;

    return <ViewGroupItems
      key={viewGroupIndex}
      groupId={groupId}
      viewId={view.id}
      viewGroup={viewGroup}
      viewGroupControlName={viewGroupControlName}
      control={control}
      openField={openField}
      onClick={onClick}
      onNewFieldClick={onNewFieldClick} />;

  });

}
