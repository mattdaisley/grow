
import { useState, useEffect } from 'react';
import CurrentApplicationService from './currentApplication.service';

const useCurrentApplicaiton = (initialValue) => {
  const [state, setState] = useState(initialValue ?? "")

  const setValue = value => {
    try {
      // If the passed value is a callback function,
      //  then call it with the existing state.
      const valueToStore = value instanceof Function ? value(state) : value
      CurrentApplicationService.SetCurrentApplicaiton(valueToStore)
      setState(value)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    try {
      const value = CurrentApplicationService.GetCurrentApplication();
      setState(value);
    } catch (error) {
      console.log(error)
    }
  }, [])

  return [state, setValue]
}

export default useCurrentApplicaiton;