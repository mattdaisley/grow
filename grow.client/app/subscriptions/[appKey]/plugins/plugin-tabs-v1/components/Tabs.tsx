"use client";

import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Box, Tabs } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Tab from '@mui/material/Tab';
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { Collection } from "../../../store/domain/Collection";
import useCollections from "../../../store/useCollections";
import useRecords from "../../../store/useRecords";
import useAppState from "../../../store/useAppState";

export interface IPluginTabsProps {
  components: Collection;
  tabsCollection: Collection;
  appStateKey?: string;
  sort_key?: string;
  tab_key?: string;
}

export default function PluginTabs({
  components,
  tabsCollection,
  appStateKey,
  sort_key,
  tab_key,
}: IPluginTabsProps) {
  // console.log("Rendering PluginTabs", components, tab_key);
  const [value, setValue] = useState<number>(undefined);

  const useAppStateResults = useAppState(appStateKey);

  const tabsCollectionResponse = useCollections([tabsCollection]);

  const tabsRecords = tabsCollectionResponse?.[tabsCollection.key]?.records;

  useEffect(() => {
    if (value === undefined && tabsRecords !== undefined && Object.keys(tabsRecords).length > 0) {
      // setValue(Object.keys(tabsRecords)[0]);
      setValue(0);
      const newAppStateValue = Object.keys(tabsRecords)[0];
      Object.entries(useAppStateResults).forEach(
        ([key, useAppStateResult]: [string, any]) => {

          useAppStateResult.onChange &&
            useAppStateResult.onChange(newAppStateValue);
        }
      );
    }
  }, [tabsRecords, value]);

  // console.log("PluginTabs tabsCollectionResponse", tabsCollectionResponse);
  if (!tabsCollectionResponse || !tabsCollectionResponse[tabsCollection.key]?.records) {
    return null;
  }

  const tabKeyField  = tabsCollection.schema.fields[tab_key]?.name ?? 'display_name';

  let tabs = Object.entries(tabsRecords);

  if (sort_key !== undefined) {
    tabs.sort((a, b) => {
      // console.log(a, b);
      if (a[1].value[sort_key] < b[1].value[sort_key]) {
        return -1;
      }
      if (a[1].value[sort_key] > b[1].value[sort_key]) {
        return 1;
      }
      return 0;
    });
  }

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    // console.log("handleChange", newValue)
    setValue(newValue);
    const newAppStateValue = Object.keys(tabsRecords)[newValue];
    Object.entries(useAppStateResults).forEach(
      ([key, useAppStateResult]: [string, any]) => {
        useAppStateResult.onChange &&
          useAppStateResult.onChange(newAppStateValue);
      }
    );
  };
    

  return (
    <>
      <Grid
        data-plugin="plugin-tabs-v1"
        data-record-key={tabsCollection?.key}
        xs={12}
      >
        {value !== undefined ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                {tabs.map(([key, tab]: [key: string, tab: any]) => (
                  // <Tab key={key} value={key} label={tab.value[tabKeyField]} />
                  <PluginTab
                    key={key}
                    tabKeyField={tabKeyField}
                    tabRecord={tab}
                  />
                ))}
              </Tabs>
            </Box>
            <ComponentsCollection components={components} />
          </>
        ) : null}
      </Grid>
    </>
  );
}

function PluginTab({tabRecord, tabKeyField, ...props}) {
  // console.log("PluginTab", tabRecord);
  const recordFieldRequest = {
    display_name: {
      record: tabRecord,
      field: tabKeyField,
    },
  };

  const { display_name } = useRecords(recordFieldRequest);

  return (
    <Tab label={display_name.value} value={tabRecord.key} {...props} />
  )
}