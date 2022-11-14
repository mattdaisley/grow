import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link'
import Image from 'next/image'

import styles from '../styles/Home.module.css'
import outletImage from '../public/outlet.png'

let socket;

export default function OutletCard({ outlet }) {
  const [lastValue, setLastValue] = useState(0);

  useEffect(() => {
    // socketInitializer();

    return () => socket && socket.close()
  }, []);

  const socketInitializer = async () => {
    socket = io("https://grow.mattdaisley.com:444/outlets");

    socket.on("reading", (msg) => {
      // console.log(msg);
      const msgJson = JSON.parse(msg);
      if (msgJson.sensor.id === sensor.id) {
        setLastValue(msgJson.value);
      }
    });
  };

  return (
    <Link href={`/outlets/${encodeURIComponent(outlet.id)}`} key={outlet.id}>
      <a className={styles.card}>
        <Image src={outletImage} width={60} height={60} />
        <h2>{outlet.name}</h2>
        <p>Index: {outlet.index}</p>
      </a>
    </Link>
  )
}