'use client';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import SensorCard from '../../components/sensor_card'

import OutletCard from '../../components/outlet_card'
import PumpCard from '../../components/pump_card'

export default function HomeComponent({ pumps, sensors, outlets }) {

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
