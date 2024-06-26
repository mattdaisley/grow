'use client';

import { createContext } from "react"

import io from "socket.io-client";

const isSSR = () => typeof window === 'undefined';
// const isSSR = () => true; // turn off websockets for now
// console.log(`SocketContext ${process.env.NEXT_PUBLIC_WEBSOCKET_HOST}`)

export const socket = !isSSR() ? io(`${process.env.NEXT_PUBLIC_WEBSOCKET_HOST}/subscriptions`) : undefined;
// export const socket = { // turn off websockets for now
//   on: (key: String, callback: Function) => {}, 
//   off: (key: String) => {}
// };

// export const socket = !isSSR() ? io("ws://192.168.86.24:3001/dynamic") : undefined;
// export const socket = !isSSR() ? io("https://grow.mattdaisley.com:444/dynamic") : undefined;


export const SocketContext = createContext(undefined);