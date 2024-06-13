"use client";
import { Record } from "./Record";

export type Records<TValue> = {
  [key: string]: Record<TValue>;
};
