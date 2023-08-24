'use client';

import { Button, Paper, TextField, useMediaQuery, useTheme } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import useUser from './../../services/User/useUser';
import useCurrentApplicaiton from './../../services/CurrentApplication/useCurrentApplication';
import { useRouter } from 'next/navigation';

export default function HomeComponent() {

  const router = useRouter();
  const theme = useTheme();
  const lessThanSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentApplication, setCurrentApplication] = useCurrentApplicaiton();
  const [user, setUser] = useUser();

  const handleCurrentApplicationChanged = (event) => {
    setCurrentApplication(event.target.value)
  }

  const handleUserNameChanged = (event) => {
    setUser(event.target.value)
  }

  const handleEnterClicked = () => {
    router.push(`/testing/${currentApplication}`)
  }

  return (
    <Container disableGutters={lessThanSm}>
      <Grid xs={12} display="flex" flexDirection="column">
        <Grid sx={{ height: '100vh', maxHeight: '33vh' }}>
        </Grid>
        <Grid sx={{ height: '100vh', maxHeight: '34vh' }} container spacing={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <Paper sx={{ p: 3, width: { sm: '50%' }}}>
            <Grid>
              <TextField label="application name" fullWidth value={currentApplication} onChange={handleCurrentApplicationChanged} />
            </Grid>
            <Grid>
              <TextField label="your name" fullWidth value={user} onChange={handleUserNameChanged}/>
            </Grid>
            <Grid display="flex" justifyContent="center" alignItems="center">
              <Button variant="outlined" fullWidth onClick={handleEnterClicked}>Enter</Button>
            </Grid>
          </Paper>
        </Grid>
        <Grid sx={{ height: '100vh', maxHeight: '33vh' }}>
        </Grid>
      </Grid>
    </Container>
  )
}
