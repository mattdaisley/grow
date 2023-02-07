'use client'

import { useEffect } from "react"

import { usePathname } from "next/navigation"

import usePages from "../../../services/pages.service";
import useStorage from "../../../services/useStorage";
import { DynamicItemForm } from "./DynamicItemForm";

export default function DynamicPage() {
  const pathname = usePathname();
  const pathnameKeys = pathname.split('/');

  const dynamicItemsName = pathnameKeys[1]
  const id = Number(pathnameKeys[2])
  const pageId = Number(pathnameKeys[3])

  const allPages = useStorage('allpages');
  const allViews = useStorage('allviews');
  const allFields = useStorage('allfields');
  const dynamicItem = useStorage(`${dynamicItemsName}-${id}`);

  // console.log(allPages, allViews, allFields, dynamicItem)

  if (!allPages?.item || !allViews?.item || !allFields?.item) {
    return null;
  }

  if (!dynamicItem?.item) {
    return <div>{dynamicItemsName} {id} not found</div>;
  }

  // console.log(allPages, allViews, allFields, dynamicItem)

  return (
    <DynamicItemForm
      id={id}
      pageId={pageId}
      dynamicItemsName={dynamicItemsName}
      dynamicItem={dynamicItem}
      allPages={allPages}
      allViews={allViews}
      allFields={allFields}
    />
  )
}

