
import DynamicEditPageTemplate from './dynamicPageTemplate';
import { getDynamicData } from './getDynamicData';

export default async function DynamicPage({ params }) {

  const itemKeys = ['pages', 'views', 'fields', 'collections']
  if (params.dynamic !== undefined) {
    itemKeys.push(params.dynamic)
  }

  console.log('DynamicEditPage', 'params:', params, 'itemKeys:', itemKeys)

  const data = await getDynamicData(itemKeys)

  return (
    <DynamicEditPageTemplate contextKey={params.dynamic} filter={params.filter?.[0]} itemKeys={itemKeys} data={data} />
  )

}

