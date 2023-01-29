'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Toolbar from "@mui/material/Toolbar";

import styles from '../styles/Home.module.css'
import ResponsiveAppBar from '../components/ResponsiveAppBar'
import Footer from '../components/Footer'

import '../styles/globals.css'

const theme = createTheme({
  palette: {
    primary: {
      main: "#90a4ae",
      light: "#c1d5e0",
      dark: "#62757f",
      contrastText: "#000000"
    },
    background: {
      main: "#eceff1",
      paper: "#ffffff",
      default: "#fafafa"
    },
    text: {
      primary: '#494949',
    }
  },
  typography: {
    h4: {
      fontWeight: 500
    },
    fontWeightLight: 500
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