import { unflatten } from 'flat';

import { getDynamicData } from "./[[...filter]]/getDynamicData";
import logger from '../../../services/logger';

export async function getNavigationPages(appName) {

  const data = await getDynamicData(['apps', 'pages']);

  const allAppsObject = {};
  data?.apps.forEach(app => {
    allAppsObject[app.valueKey] = app;
  });
  const allApps = unflatten(allAppsObject);

  const allPagesObject = {};
  data?.pages.forEach(page => {
    allPagesObject[page.valueKey] = page;
  });
  const allPages = unflatten(allPagesObject);

  if (allApps?.apps === undefined || Object.keys(allApps.apps).length === 0) {
    return []
  }

  logger.log('getNavigationPages', { allApps: allApps.apps, allPages: allPages.pages })

  const currentAppKey = Object.keys(allApps.apps).find(appKey => {
    return allApps.apps[appKey].name?.value === appName
  });
  const currentApp = allApps.apps[currentAppKey]

  logger.log('getNavigationPages', JSON.stringify({ currentAppKey, currentApp }, null, 2))

  if (currentApp?.pages === undefined || Object.keys(currentApp.pages).length === 0) {
    return []
  }

  const pagesObject = {};
  Object.keys(currentApp?.pages).forEach(pageKey => {
    const referencedPageKey = currentApp?.pages[pageKey].id.value
    pagesObject[referencedPageKey] = allPages.pages[referencedPageKey]
  })



  return pagesObject ?? [];
}
