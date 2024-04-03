"use client";

import { createContext } from "react"
import { App } from "./domain/App";

export const SubscriptionStoreContext = createContext<App|undefined>(undefined);