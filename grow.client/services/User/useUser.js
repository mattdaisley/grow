
import { useState, useEffect } from 'react';
import UserService from './user.service';

const useUser = (initialValue) => {
  const [state, setState] = useState(initialValue ?? "")

  const setValue = value => {
    try {
      // If the passed value is a callback function,
      //  then call it with the existing state.
      const valueToStore = value instanceof Function ? value(state) : value
      UserService.SetUser(valueToStore)
      setState(value)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    try {
      const value = UserService.GetUser();
      setState(value);
    } catch (error) {
      console.log(error)
    }
  }, [])

  return [state, setValue]
}

export default useUser;