"use client";

import Grid from "@mui/material/Unstable_Grid2";
import useCollections from "../useCollections";
import { RecordPlugin } from "./RecordPlugin";

export function ComponentsCollection({ components }) {
  const collectionRecords = useCollections([components]);
  // console.log("ComponentsCollection", collectionRecords, components);
  // console.log(
  //   "ComponentsCollection",
  //   !collectionRecords,
  //   !collectionRecords[components.key]?.records
  // );
  if (!collectionRecords || !collectionRecords[components.key]?.records) {
    return null;
  }

  const componentRecords = collectionRecords[components.key].records;
  // console.log("ComponentsCollection componentRecords", componentRecords);

  return (
    <>
      <Grid container>
        {Object.entries(componentRecords).map(([key, componentRecord]) => {
          return <RecordPlugin key={key} record={componentRecord} />;
        })}
      </Grid>
    </>
  );
}
