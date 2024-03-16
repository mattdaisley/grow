'use client'

import Box from "@mui/material/Box";
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';

const editDrawerWidth = 450;

export default function SubscriptionsTemplate(props) {

  console.log(
    "SubscriptionsTemplate",
    props
  );

  return (
    <div>
      <Grid
        xs={12}
        container
        spacing={4}
        sx={{ width: "100%", height: "100%" }}
      >
        <Box
          sx={{
            flexGrow: 1,
            pt: { xs: 2, md: 4 },
            pl: { xs: 2, md: 4 },
            pr: `${editDrawerWidth}px`,
            height: "100%",
          }}
        >
          <Grid xs={12} sx={{ width: "100%", height: "100%" }}>
            <Paper
              sx={{
                width: "100%",
              }}
            >
              <Grid>
                {Array(30)
                  .fill(null)
                  .map((_, index) => (
                    <input
                      key={index}
                      value={`test${index}`}
                      onChange={() => {}}
                    />
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
            <Grid>
              {Array(30)
                .fill(null)
                .map((_, index) => (
                  <p key={index}>
                    <input value={`test${index}`} onChange={() => {}} />
                  </p>
                ))}
            </Grid>
          </Paper>
        </Box>
      </Grid>
    </div>
  );
}