'use client';

import { Roboto } from '@next/font/google'

import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { SocketContext, socket } from './SocketContext';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import Footer from '../components/footer';

export const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
})

export const theme = createTheme({
  spacing: 8,
  palette: {
    primary: {
      main: "#90a4ae",
      light: "#c1d5e0",
      dark: "#62757f",
      contrastText: "#000000"
    },
    secondary: {
      main: "#26a69a",
      light: "#80e27e",
      dark: "#087f23",
      contrastText: "#000000"
    },
    paper: {
      default: "#ffffff",
      main: "#fafafa"
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
    fontFamily: roboto.style.fontFamily,
    h4: {
      fontWeight: 500
    },
    h5: {
      fontWeight: 500
    },
    subtitle1: {
      fontWeight: 500
    },
    fontWeightLight: 500
  }
});

export function AppLayout({ pages, children }) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <SocketContext.Provider value={socket}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div>
              <ResponsiveAppBar pages={pages} />
              {children}
            </div>
            <Footer />
          </ThemeProvider>
        </SocketContext.Provider>
      </body>
    </html>
  );
}
