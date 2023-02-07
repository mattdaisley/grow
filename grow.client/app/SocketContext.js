'use client';

import { createContext } from "react"

import io from "socket.io-client";

export const socket = io("http://localhost:3001/dynamic");
export const SocketContext = createContext();