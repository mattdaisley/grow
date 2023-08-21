import { getDynamicData } from "./[[...filter]]/getDynamicData";
import { unflatten } from 'flat';

export async function getNavigationPages() {
  const data = await getDynamicData(['pages']);
  const pagesObject = {};
  data?.pages.forEach(page => {
    pagesObject[page.valueKey] = page;
  });

  const allPages = unflatten(pagesObject);

  return allPages.pages ?? [];
}
