import { useContext, useState } from "react";
import { usePathname } from "next/navigation";

import { SubscriptionStoreContext } from "./SubscriptionStoreContext";
import useRecords, { useRecordsResult } from "./useRecords";

export default function useAppState(key: string, updateSearchParams: boolean = true): useRecordsResult {
  const pathname = usePathname();

  const app = useContext(SubscriptionStoreContext);
  const [callbackUpdated, setCallbackUpdated] = useState(false);

  const record = app.getFromAppState(key);

  const useRecordsResult = useRecords({ [key]: { record } });
  // console.log('useAppState useRecordsResult', key, useRecordsResult);

  const originalOnChange = useRecordsResult[key].onChange;
  if (originalOnChange !== undefined && updateSearchParams) {
    if (!callbackUpdated) {
      setCallbackUpdated(true);
      useRecordsResult[key].onChange = (value) => {
        // console.log("adding to app state callback", key, value);
        let params = new URL(document.location.toString()).searchParams;

        if (value === false) {
          params.delete(key);
        }
        else {
          params.set(key, value);
        }

        window.history.pushState({}, "", pathname + "?" + params.toString());

        originalOnChange(value);
      };
    }
  }
  

  return useRecordsResult;
}