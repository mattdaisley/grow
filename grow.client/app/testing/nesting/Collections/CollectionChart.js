'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';

import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Box';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { ShowCollectionLabel } from "../ShowCollection";
import { useSubscription } from '../useSubscription';
import { useGridCollectionColumns } from './useGridCollectionColumns';
import logger from '../../../../services/logger';

export default function CollectionChart({ pageProps, collectionProps }) {

  const [forcedState, updateState] = useState();
  const forceUpdate = useCallback((field) => {
    logger.log('CollectionChart forceUpdate', field);
    updateState({})
  }, []);
  const callback = debounce(forceUpdate, 100)

  const [forcedStateSets, updateStateSets] = useState();
  const forceUpdateSets = useCallback((field) => {
    logger.log('CollectionChart forceUpdateSets', field);
    updateStateSets({})
  }, []);
  const callbackSets = debounce(forceUpdateSets, 100)

  const collectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.keyPrefix, keyPrefix: undefined });
  const contextCollectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined });
  // const contextCollectionFields = pageProps.itemsMethods.getTreeMapItem(collectionProps.contextKey);
  const groupByFieldId = useSubscription({ ...pageProps, itemKey: pageProps.keyPrefix, keyPrefix: undefined, searchSuffix: 'group-by' });
  const groupByField = pageProps.itemsMethods.getTreeMapItem(`fields.${groupByFieldId}`)
  const groupBy = groupByField?.get('name') ?? groupByFieldId ?? 'id'

  const xAxisFieldId = useSubscription({ ...pageProps, itemKey: pageProps.keyPrefix, keyPrefix: undefined, searchSuffix: 'x-axis' });
  const xAxisField = pageProps.itemsMethods.getTreeMapItem(`fields.${xAxisFieldId}`)
  const xAxis = xAxisField?.get('name') ?? xAxisFieldId ?? 'id'

  const yAxisFieldId = useSubscription({ ...pageProps, itemKey: pageProps.keyPrefix, keyPrefix: undefined, searchSuffix: 'y-axis' });
  const yAxisField = pageProps.itemsMethods.getTreeMapItem(`fields.${yAxisFieldId}`)
  const yAxis = yAxisField?.get('name') ?? xAxisFieldId ?? 'id'

  const colors = ["#82ca9d", "#fad3a0", "#a0bbfa", "#edabc5"]

  const [chartDataSets, setChartDataSets] = useState([])

  // const rows = useMemo(() => getCollectionRows(contextCollectionFields), [contextCollectionFields?.size])

  const { chartData, uniqueDataSets, collectionContextKeys } = useMemo(() => {

    const chartData = []
    const uniqueDataSets = []
    const collectionContextKeys = []

    const dataMap = new Map()
    const uniqueValues = []

    if (contextCollectionFields) {
      contextCollectionFields.forEach((item) => {
        /*
        groupBy: selected_outlet 
        xAxis: created_date 
        yAxis: output_state

        {"e4032382-2f9e-431f-91dd-809011aecb0a" => Map(4)}
          {"selected_outlet" => "jalepenos_collections_07d61ba1-bfdd-4905-9572-9ff911553936.c1314206-e902-4b29-b076-72860afbe127"}
          {"created_date" => "2023-04-03T17:52:31.498Z"}
          {"updated_date" => "2023-04-03T17:52:31.498Z"}
          {"output_state" => "jalepenos_collections_d2acc23e-ea82-4da6-8bb9-3d5e5837c75f.f6f9a391-21c3-4fe9-be8f-dbfa4cc09e7d"}
        */
        const normalizedXAxisName = item.get(xAxis).split('.')[0];

        const groupNameField = item.get(groupBy);
        const groupName = groupNameField;
        // const groupName = pageProps.itemsMethods.getTreeMapItem(`${groupNameField}.outlet_name`);

        // const groupNameCollectionContextKey = groupNameField.split('.')[0];
        // let groupNameCollectionContextKeysIndex = collectionContextKeys.indexOf(groupNameCollectionContextKey);
        // if (groupNameCollectionContextKeysIndex === -1) {
        //   collectionContextKeys.push(groupNameCollectionContextKey);
        // }

        const valueField = item.get(yAxis);
        const value = pageProps.itemsMethods.getTreeMapItem(`${valueField}.on_off`);

        const valueCollectionContextKey = valueField.split('.')[0];
        let valueCollectionContextKeysIndex = collectionContextKeys.indexOf(valueCollectionContextKey);
        if (valueCollectionContextKeysIndex === -1) {
          collectionContextKeys.push(valueCollectionContextKey);
        }

        if (groupName === undefined || value === undefined) {
          return;
        }

        // logger.log('CollectionChart', normalizedXAxisName, groupNameField, groupName, valueField, value)

        let xAxisGroup = dataMap.get(normalizedXAxisName);
        if (!xAxisGroup) {
          xAxisGroup = new Map();
          dataMap.set(normalizedXAxisName, xAxisGroup);
        }

        let dataGroup = xAxisGroup.get(groupName);
        if (!dataGroup) {
          dataGroup = new Map();
          xAxisGroup.set(groupName, dataGroup);
        }

        if (uniqueDataSets.filter((item) => item.dataKey === groupName).length === 0) {
          uniqueDataSets.push({ dataKey: groupName, name: groupName });
        }

        dataGroup.set(yAxis, value);

        let uniqueValueIndex = uniqueValues.indexOf(value);
        if (uniqueValueIndex === -1) {
          uniqueValues.push(value);
        }
      })

      uniqueValues.sort()

      const dataMapArray = Array.from(dataMap.keys());

      // Sort the array of date strings in ascending order
      dataMapArray.sort((a, b) => new Date(a) - new Date(b));

      // Create a new Map with sorted keys
      const sortedDataMap = new Map();
      dataMapArray.forEach(key => {
        sortedDataMap.set(key, dataMap.get(key));
      });

      const options = { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };

      const hoursAgo = 24;
      const interval = 60; // seconds

      // console.log(dataMapArray[dataMapArray.length - 1])

      let now = new Date(new Date().toISOString());
      if (dataMapArray.length > 0) {
        now = new Date(new Date(dataMapArray[dataMapArray.length - 1]).toISOString());
      }
      const timeZoneOffset = now.getTimezoneOffset() * 60 * 1000
      const millisecondsAgo = hoursAgo * 60 * 60 * 1000; // 4 hours = 4 * 60 * 60 * 1000 milliseconds
      const timeRangeOffset = new Date(now.getTime() - millisecondsAgo + timeZoneOffset);

      // console.log(now, ',', now.getTimezoneOffset(),',', timeZoneOffset, timeRangeOffset)

      let lastRow = {};
      sortedDataMap.forEach((xAxisGroup, xAxisName) => {

        let row = { ...lastRow, xAxisName };
        
        let rowTimeString
        try {
          const xAxisDate = new Date(xAxisName)
          const rowTime = xAxisDate.getTime() - ((xAxisDate.getSeconds() % interval) * 1000) - timeZoneOffset
          rowTimeString = new Date(rowTime).toLocaleString('en-US', options);
        }
        catch (e) {
          lastRow = row;
          return;
        }

        row.name = rowTimeString;
        xAxisGroup.forEach((dataGroup, groupName) => {
          row[groupName] = uniqueValues.indexOf(dataGroup.get(yAxis));
        })

        // console.log('CollectionChart', new Date(xAxisName), timeRangeOffset, row)

        // Filter the array to include only dates within the time range

        // console.log(new Date(xAxisName), '-', timeRangeOffset, '-', new Date(xAxisName) < timeRangeOffset, '-', row)
        if (new Date(xAxisName) < timeRangeOffset) {
          lastRow = row;
          return;
        }

        // Add more values to get a consistent 1 second interval
        if (lastRow?.name !== undefined) {
          let secondsOffset = 0;
          let timesToCompare = []
          for (let i = 0; i < interval; i++) {
            let lastDate = new Date(lastRow.xAxisName)
            let timeToCompare = new Date(lastDate - ((lastDate.getSeconds() % interval) * 1000) - timeZoneOffset + (secondsOffset + i) * 1000).toLocaleString('en-US', options)
            timesToCompare.push(timeToCompare)
          }

          while (!timesToCompare.includes(rowTimeString)) {
            // console.log('CollectionChart timecompare', lastRow.xAxisName, timesToCompare, xAxisName, rowTimeString, nowTimeString)
            chartData.push({ ...lastRow, name: timesToCompare[0] });

            secondsOffset += interval;

            timesToCompare = []
            for (let i = 0; i < interval; i++) {
              let lastDate = new Date(lastRow.xAxisName)
              let timeToCompare = new Date(lastDate - ((lastDate.getSeconds() % interval) * 1000) - timeZoneOffset + (secondsOffset + i) * 1000).toLocaleString('en-US', options)
              timesToCompare.push(timeToCompare)
            }
            // console.log('loop', lastRow.xAxisName, timeToCompare, xAxisName, rowTimeString, nowTimeString)
          }
        }

        // Add the latest value
        chartData.push(row);

        lastRow = row;
      })
    }

    logger.log('CollectionChart calculating rows', 'chartData:', chartData, 'uniqueDataSets:', uniqueDataSets, 'collectionContextKeys:', collectionContextKeys, 'contextCollectionFields:', contextCollectionFields, 'contextCollectionFields?.size:', contextCollectionFields?.size);

    return { chartData, uniqueDataSets, collectionContextKeys };
  }, [contextCollectionFields?.size, forcedState])


  useEffect(() => {
    if (collectionContextKeys.length > 0) {
      pageProps.itemsMethods.getItems(collectionContextKeys);
      collectionContextKeys.forEach((collectionContextKey) => {
        pageProps.itemsMethods.subscribeMap(collectionContextKey, callback);
      })
    }

    return () => {
      collectionContextKeys.forEach((collectionContextKey) => {
        pageProps.itemsMethods.unsubscribeMap(collectionContextKey, callback);
      })
    }
  }, [JSON.stringify(collectionContextKeys)])

  useEffect(() => {
    logger.log('CollectionChart', 'uniqueDataSets:', uniqueDataSets, 'chartDataSets:', chartDataSets);
    const groupNameCollectionContextKeys = [];
    const newChartDataSets = [];

    uniqueDataSets.forEach((uniqueDataSet) => {
      const groupName = pageProps.itemsMethods.getTreeMapItem(`${uniqueDataSet.dataKey}.outlet_name`);
      if (groupName !== undefined) {
        newChartDataSets.push({ ...uniqueDataSet, name: groupName });
      }

      const groupNameCollectionContextKey = uniqueDataSet.dataKey.split('.')[0];
      let groupNameCollectionContextKeysIndex = collectionContextKeys.indexOf(groupNameCollectionContextKey);
      if (groupNameCollectionContextKeysIndex === -1) {
        groupNameCollectionContextKeys.push(groupNameCollectionContextKey);
      }
    })

    setChartDataSets(newChartDataSets);

    if (groupNameCollectionContextKeys.length > 0) {
      pageProps.itemsMethods.getItems(groupNameCollectionContextKeys);
      groupNameCollectionContextKeys.forEach((collectionContextKey) => {
        pageProps.itemsMethods.subscribeMap(collectionContextKey, callbackSets);
      })
    }

    return () => {
      groupNameCollectionContextKeys.forEach((collectionContextKey) => {
        pageProps.itemsMethods.unsubscribeMap(collectionContextKey, callbackSets);
      })
    }
  }, [JSON.stringify(uniqueDataSets), forcedStateSets])

  logger.log('CollectionChart', 'groupBy:', groupBy, 'xAxis:', xAxis, 'yAxis:', yAxis, 'chartDataSets:', chartDataSets, 'collectionFields:', collectionFields, 'pageProps:', pageProps, 'collectionProps:', collectionProps);

  return (
    <>
      <Paper sx={{
        width: '100%',
        pb: 2, px: 2
      }}>
        <ShowCollectionLabel {...pageProps} />
        <Grid container alignItems="right">
          <Grid>
            <DateTimePicker
              label="Start Date/Time"
              slotProps={{ textField: { size: 'small', margin: 'dense' } }} />
          </Grid>
          <Grid>
            <DateTimePicker
              label="End Date/Time"
              slotProps={{ textField: { size: 'small', margin: 'dense' } }} />
          </Grid>
        </Grid>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            width={500}
            height={400}
            data={chartData}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis dataKey={"name"} />
            {/* <YAxis interval={0}/> */}
            <Tooltip />
            {chartDataSets.map((value, index) => (
              <Area key={index} type="stepAfter" dataKey={value.dataKey} name={value.name} stroke={colors[index]} fill={colors[index]} fillOpacity={0.3} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

    </>
  );
}
