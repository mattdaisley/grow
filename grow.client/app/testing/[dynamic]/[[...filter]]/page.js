
import DynamicEditPageTemplate from './dynamicPageTemplate';

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

export async function getDynamicData(itemKeys) {
  const data = {}


  const requests = itemKeys.map(itemKey => getItems(itemKey))

  const startTime = new Date();

  const responses = await Promise.all(requests);

  const endTime = new Date();
  const timeDiff = endTime - startTime; //in ms

  responses.forEach(response => {
    Object.keys(response).forEach(itemKey => data[itemKey] = response[itemKey])
  });


  console.log('getDynamicData', `- ${timeDiff}ms - loaded data -`, Object.keys(data).map(itemKey => `${itemKey}: ${data[itemKey].length}`).join(' '))

  return data;
}

async function getItems(itemKey) {
  const res = await fetch(`http://192.168.86.249:3001/dynamic/${itemKey}`);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  return res.json();
}