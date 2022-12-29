import { useState, useEffect, forwardRef, ChangeEvent } from 'react';

import Link from 'next/link'

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { Item } from '../index';

export default function ViewsPage() {

  const [allViewsJson, setAllViewsJson] = useState("");
  const [allViewsDefinition, setAllViewsDefinition] = useState();
  const [lastId, setLastId] = useState(0);

  useEffect(() => {
    const loadAllViews = () => {
      const localAllViewsJson = localStorage.getItem('allviews');
      // console.log('localAllViewsJson: ', localAllViewsJson)
      if (localAllViewsJson && localAllViewsJson !== allViewsJson) {
        try {
          setAllViewsJson(localAllViewsJson);

          var parsedJson = JSON.parse(localAllViewsJson);
          setAllViewsDefinition(parsedJson);

          const allViewIds = parsedJson.views.map(x => x.id) ?? 0;
          var parsedLastId = Math.max(...allViewIds);
          // console.log(allViewIds, parsedLastId);
          setLastId(parsedLastId);
        }
        catch (e) {
          console.log(e);
        }
      }
    }

    loadAllViews();

    const loadInterval = setInterval(loadAllViews, 2000);

    return () => clearInterval(loadInterval);
  }, []);

  // console.log('allViewsDefinition: ', allViewsDefinition)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          {
            allViewsDefinition?.views.map(view => {
              return <Grid xs={12} key={view.id}>
                <Item>
                  {view.id}: {view.name} | <Link href={`/components/views/${encodeURIComponent(view.id)}`}>Edit</Link>
                </Item>
              </Grid>
            })
          }
          <Grid xs={12}>
            <Link href={`/components/views/${encodeURIComponent(lastId + 1)}`}>
              <Button>Add New View</Button>
            </Link>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
