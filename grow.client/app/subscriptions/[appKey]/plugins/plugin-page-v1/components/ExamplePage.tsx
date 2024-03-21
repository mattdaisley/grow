"use client";
import Box from "@mui/material/Box";
import { Container, Paper } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

const editDrawerWidth = 450;

export function ExamplePage(props) {
  return (
    <>
      <Container maxWidth={false}>
        <Box
          sx={{
            flexGrow: 1,
            pt: { xs: 4, md: 6 },
            pr: `${editDrawerWidth}px`,
            pb: { xs: 4, md: 6 },
            pl: { xs: 2, md: 4 },
          }}
        >
          <Grid container spacing={4} xs={12}>
            <Paper
              sx={{
                width: "100%",
              }}
            >
              <Grid>
                {Array(30)
                  .fill(null)
                  .map((_, index) => (
                    <div>
                      <input
                        key={index}
                        value={`test${index}`}
                        onChange={() => {}}
                      />
                    </div>
                  ))}
              </Grid>
            </Paper>
          </Grid>
        </Box>
        <Box
          sx={{
            position: "fixed",
            top: 64,
            right: 0,
            width: `${editDrawerWidth}px`,
            height: "calc(100% - 64px)",
            overflowY: "scroll",
            borderLeft: "1px solid lightgray",
          }}
        >
          <Paper
            sx={{
              width: "100%",
              minHeight: "100%",
            }}
          >
            <Grid sx={{ padding: { xs: 2 } }}>
              {Array(30)
                .fill(null)
                .map((_, index) => (
                  <div key={index}>
                    <input value={`test${index}`} onChange={() => {}} />
                  </div>
                ))}
            </Grid>
          </Paper>
        </Box>
      </Container>
    </>
  );
}
