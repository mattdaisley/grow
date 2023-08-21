'use client';

import { Button, Paper, TextField, useMediaQuery, useTheme } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

export default function HomeComponent() {

  const theme = useTheme();
  const lessThanSm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container disableGutters={lessThanSm}>
      <Grid xs={12} display="flex" flexDirection="column">
        <Grid sx={{ height: '100vh', maxHeight: '33vh' }}>
        </Grid>
        <Grid sx={{ height: '100vh', maxHeight: '34vh' }} container spacing={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <Paper sx={{ p: 3, width: { sm: '50%' }}}>
            <Grid><TextField label="application name" fullWidth /></Grid>
            <Grid><TextField label="your name" fullWidth /></Grid>
            <Grid display="flex" justifyContent="center" alignItems="center">
              <Button variant="outlined" fullWidth >Enter</Button>
            </Grid>
          </Paper>
        </Grid>
        <Grid sx={{ height: '100vh', maxHeight: '33vh' }}>
        </Grid>
      </Grid>
    </Container>
  )
}
