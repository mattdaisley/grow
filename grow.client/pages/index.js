import Link from 'next/link'
import SensorCard from '../components/sensor_card'
import styles from '../styles/Home.module.css'

function Home({ pumps, sensors }) {
  return (
    <div className={styles.grid}>
      {pumps.map(pump => {
        return (
          <Link href={`/pump/${encodeURIComponent(pump.id)}`} key={pump.id}>
            <a className={styles.card}>
              <h2>{pump.id}: {pump.name}</h2>
              <p>Index: {pump.index}</p>
              <p>Dose Rate: {pump.doseRate}</p>
            </a>
          </Link>
        )
      })}

      {sensors.map(sensor => <SensorCard sensor={sensor} key={sensor.id} />)}
    </div>
  )
}

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const pumpsRes = await fetch(`https://grow.mattdaisley.com:444/pumps`)
  const pumps = await pumpsRes.json()

  const sensorsRes = await fetch(`https://grow.mattdaisley.com:444/sensors`)
  const sensors = await sensorsRes.json()

  // Pass data to the page via props
  return { props: { pumps, sensors } }
}

export default Home;