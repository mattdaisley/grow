export default async function loadSensorReadings(id, start_time, interval, limit) {
  let url = `https://grow.mattdaisley.com:444/sensors/${id}/readings`;
  if (start_time || interval || limit) {
    let params = {};
    if (start_time) {
      params = { ...params, start_time: new Date(start_time).toISOString('en-us', { timeZone: 'UTC' }) };
    }
    if (interval) {
      params = { ...params, interval };
    }
    if (limit) {
      params = { ...params, limit };
    }

    url += "?" + new URLSearchParams(params);
  }

  const readingsRes = await fetch(url);
  const readings = await readingsRes.json();
  return readings;
};
