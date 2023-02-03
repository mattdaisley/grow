'use client';
import { ViewItems } from '../ViewItems/ViewItems';

export function GroupItems({ group, groupControlName, control, openField, onClick, onNewFieldClick }) {

  return group.views?.map((view, viewIndex) => {
    const viewControlName = `${groupControlName}.views.${viewIndex}`;

    return <ViewItems
      key={viewIndex}
      groupId={group.id}
      view={view}
      viewControlName={viewControlName}
      control={control}
      openField={openField}
      onClick={onClick}
      onNewFieldClick={onNewFieldClick} />;
  });
}
