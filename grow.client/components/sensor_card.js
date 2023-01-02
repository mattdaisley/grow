'use client';

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import Link from 'next/link'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';

import styles from '../styles/Home.module.css'

let socket;

export default function SensorCard({ sensor }) {
  const [lastValue, setLastValue] = useState(0);

  useEffect(() => {
    socketInitializer();

    return () => socket && socket.close()
  }, []);

  const socketInitializer = async () => {
    socket = io("https://grow.mattdaisley.com:444/sensors");

    socket.on("reading", (msg) => {
      // console.log(msg);
      const msgJson = JSON.parse(msg);
      if (msgJson.sensor.id === sensor.id) {
        setLastValue(msgJson.value);
      }
    });
  };

  return (
    <Grid xs={3}>
      <Card>
        <CardContent>
          <Link href={`/sensors/${encodeURIComponent(sensor.id)}`}>
            <h2>{sensor.id}: {sensor.name}</h2>
            <p>Index: {sensor.index}</p>
            <p>Offset: {sensor.offset}</p>
            <p>Value: {lastValue.toFixed(2)}</p>
          </Link>
        </CardContent>
      </Card>
    </Grid>
  )
}