import Link from 'next/link'
import SensorCard from '../components/sensor_card'
import styles from '../styles/Home.module.css'

import OutletCard from '../components/outlet_card'
import PumpCard from '../components/pump_card'

function Home({ pumps, sensors, outlets }) {
  return (
    <>
      <div className={styles.grid}>
        {pumps.map(pump => <PumpCard pump={pump} key={pump.id} />)}
      </div>

      <div className={styles.grid}>
        {sensors.map(sensor => <SensorCard sensor={sensor} key={sensor.id} />)}
      </div>

      <div className={styles.grid}>
        {outlets.map(outlet => <OutletCard outlet={outlet} key={outlet.id} />)}
      </div>
    </>
  )
}

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const pumpsRes = await fetch(`https://grow.mattdaisley.com:444/pumps`)
  const pumps = await pumpsRes.json()

  const sensorsRes = await fetch(`https://grow.mattdaisley.com:444/sensors`)
  const sensors = await sensorsRes.json()

  const outletsRes = await fetch(`https://grow.mattdaisley.com:444/outlets`)
  const outlets = await outletsRes.json()

  // Pass data to the page via props
  return { props: { pumps, sensors, outlets } }
}

export default Home;