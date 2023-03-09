'use client';

import { createContext } from "react"

import io from "socket.io-client";

const isSSR = () => typeof window === 'undefined';

export const socket = !isSSR() ? io("ws://192.168.86.249:3001/dynamic") : undefined;
// export const socket = !isSSR() ? io("https://grow.mattdaisley.com:444/dynamic") : undefined;


export const SocketContext = createContext();