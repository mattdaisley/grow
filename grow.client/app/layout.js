'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import styles from '../styles/Home.module.css'
import ResponsiveAppBar from '../components/ResponsiveAppBar'
import Footer from '../components/Footer'

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

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className={styles.container}>

            <ResponsiveAppBar />

            <main className={styles.main}>
              {children}
            </main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html >
  )
}