import Head from 'next/head'

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Layout from '../components/layout'
import '../styles/globals.css'

const theme = createTheme({
  palette: {
    primary: {
      main: "#212121",
      light: "#484848",
      dark: "#000000"
    },
    background: {
      paper: "#F5F5F6",
      default: "#E1E2E1"
    }
  }
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Grow App</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  )
}

export default MyApp
