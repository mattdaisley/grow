import { useContext, useEffect, useState } from "react";
import { SubscriptionStoreContext } from "./SubscriptionStoreContext";
import useRecords, { useRecordsResult } from "./useRecords";

export default function useAppState(key: string): useRecordsResult {
  const app = useContext(SubscriptionStoreContext);

  const record = app.getFromAppState(key);

  const useRecordsResult = useRecords({ [key]: { record } });
  // console.log('useAppState useRecordsResult', key, useRecordsResult);

  return useRecordsResult;
}