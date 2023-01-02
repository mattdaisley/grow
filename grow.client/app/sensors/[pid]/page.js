import getDateTime from "./getDateTime";
import loadSensorReadings from "./loadSensorReadings";
import Sensors from "./sensors";

export default async function SensorsPage({ params }) {

  // Fetch data from external API
  const sensorRes = await fetch(`https://grow.mattdaisley.com:444/sensors/${params.pid}`)
  const sensor = await sensorRes.json()

  // Fetch data from external API
  const readings = await loadSensorReadings(params.pid, getDateTime(24), 5 * 60, 5 * 60);

  return (
    <Sensors sensor={sensor} readings={readings} />
  )
}