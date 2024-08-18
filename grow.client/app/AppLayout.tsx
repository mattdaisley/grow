"use client";

import { Roboto } from "next/font/google";

import { createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { green, lightBlue } from "@mui/material/colors";

declare module "@mui/material/styles" {
  interface Palette {
    brackets: Palette["primary"];
  }

  interface PaletteOptions {
    brackets?: PaletteOptions["primary"];
  }
}

export const roboto = Roboto({
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const theme = createTheme({
  spacing: 8,
  palette: {
    primary: green,
    secondary: lightBlue,
    // primary: {
    // main: "#E74F09",
    // main: "#90a4ae",
    // light: "#c1d5e0",
    // dark: "#62757f",
    // contrastText: "#000",
    // },
    // secondary: {
    //   main: "#26a69a",
    //   light: "#80e27e",
    //   dark: "#087f23",
    //   contrastText: "#000000",
    // },
    background: {
      paper: "#ffffff",
      default: "#fafafa",
    },
    text: {
      primary: "#494949",
    },
    brackets: {
      main: "#6495ED",
      contrastText: "white",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    fontWeightLight: 500,
  },
});

export function AppLayout({ pages, children }) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="app-container">{children}</div>
          </ThemeProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
