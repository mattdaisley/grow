
import { getDynamicData } from "../../[[...filter]]/getDynamicData";
import DynamicEditPageTemplate from './dynamicEditPageTemplate';

export default async function DynamicEditPage({ params }) {

  // const itemKeys = ['apps', 'pages']
  const itemKeys = ['apps', 'pages', 'views', 'fields', 'collections']
  if (params.dynamic !== undefined) {
    itemKeys.push(params.dynamic)
    // itemKeys.push(`${params.dynamic}_pages`)
  }

  // console.log('DynamicEditPage', 'params:', params, 'itemKeys:', itemKeys)

  const data = await getDynamicData(itemKeys)

  return (
    <DynamicEditPageTemplate contextKey={params.dynamic} filter={params.filter?.[0]} itemKeys={itemKeys} data={data} />
  )

}