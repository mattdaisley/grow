import { useContext, useEffect, useState } from "react";
import { SubscriptionStoreContext } from "./SubscriptionStoreContext";

export default function useAppState(key: string): { value: any, onChange: Function } {
  const app = useContext(SubscriptionStoreContext);

  const [value, setValue] = useState({ value: app.appState[key], onChange: undefined });

  useEffect(() => {
    //console.log('useAppState useEffect', key)
    if (!key) return;

    // const values: useRecordsResult = {};
    const callbacks: {[key:string]: Function} = {} 

    function callback(newValue: any) {
      //console.log('useAppState callback', key, newValue)
      setValue((currentValue) => ({...currentValue, value: newValue}));
      // setValue({...value, [field]: newRecord.value[field]});
    }

    callbacks[key] = callback;
    app.subscribe(key, callback);

    function onChange (newValue: any) {
      //console.log('useAppState onChange', key, newValue)
      app.setAppState(key, newValue);
    }

    setValue({ ...value, onChange});

    // console.log('useRecord callbacks', callbacks)

    return () => {
      //console.log('useAppState cleanup', key)
      Object.entries(callbacks).forEach(([key, callback]) => {
        app.unsubscribe(key, callback);
      });
    };

  }, [app, key, setValue]);

  //console.log('useAppState', key, value)

  return value
}