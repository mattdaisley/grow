import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link'
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
    <Link href={`/sensors/${encodeURIComponent(sensor.id)}`}>
      <a className={styles.card}>
        <h2>{sensor.id}: {sensor.name}</h2>
        <p>Index: {sensor.index}</p>
        <p>Offset: {sensor.offset}</p>
        <p>Value: {lastValue.toFixed(2)}</p>
      </a>
    </Link>
  )
}