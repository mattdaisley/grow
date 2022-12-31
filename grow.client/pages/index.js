import Link from 'next/link'

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import SensorCard from '../components/sensor_card'
import styles from '../styles/Home.module.css'

import OutletCard from '../components/outlet_card'
import PumpCard from '../components/pump_card'

function Home({ pumps, sensors, outlets }) {
  return (
    <Container>
      <Grid xs={12} container spacing={2}>
        <Grid xs={12} container spacing={2} display="flex" justifyContent="center" alignItems="center">
          {pumps.map(pump => <PumpCard pump={pump} key={pump.id} />)}
        </Grid>
        <Grid xs={12}>
          <Grid container spacing={2} display="flex" justifyContent="center" alignItems="center">
            {sensors.map(sensor => <SensorCard sensor={sensor} key={sensor.id} />)}
          </Grid>
        </Grid>
        <Grid xs={12}>
          <Grid container spacing={2} display="flex" justifyContent="center" alignItems="center">
            {outlets.map(outlet => <OutletCard outlet={outlet} key={outlet.id} />)}
          </Grid>
        </Grid>
      </Grid>
    </Container>
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