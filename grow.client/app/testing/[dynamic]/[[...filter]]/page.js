
import { getNavigationPages } from '../getNavigationPages';
import DynamicPageTemplate from './dynamicPageTemplate';
import { getDynamicData } from './getDynamicData';

export default async function DynamicPage({ params }) {

  const itemKeys = ['apps', 'pages', 'views', 'fields', 'collections']
  if (params.dynamic !== undefined) {
    itemKeys.push(params.dynamic)
  }

  const pages = await getNavigationPages(params.dynamic)
  const data = await getDynamicData(itemKeys)

  let filter = params.filter?.[0]
  if (filter === undefined) {
    if (Object.keys(pages).length > 0) {
      filter = Object.keys(pages)[0]
    }
  }

  // console.log('DynamicPage', 'filter:', filter, 'itemKeys:', itemKeys, 'pages:', pages)

  return (
    <DynamicPageTemplate contextKey={params.dynamic} filter={filter} itemKeys={itemKeys} data={data} />
  )

}

