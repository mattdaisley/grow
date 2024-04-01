
export async function getDynamicData(itemKeys) {
  const data = {};

  const requests = itemKeys.map(itemKey => getItems(itemKey));

  const startTime = new Date();

  const responses = await Promise.all(requests);

  const endTime = new Date();
  const timeDiff = endTime - startTime; //in ms

  responses.forEach(response => {
    Object.keys(response).forEach(itemKey => data[itemKey] = response[itemKey]);
  });

  // console.log('getDynamicData', `- ${timeDiff}ms - loaded data -`, Object.keys(data).map(itemKey => `${itemKey}: ${data[itemKey].length}`).join(' '));

  return data;
}

async function getItems(itemKey) {

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/dynamic/${itemKey}`);
  // const res = await fetch(`http://192.168.86.24:3001/dynamic/${itemKey}`);
  // const res = await fetch(`https://grow.mattdaisley.com:444/dynamic/${itemKey}`);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  return res.json();
}
