import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link'
import Image from 'next/image'

import styles from '../styles/Home.module.css'
import floraBloom from '../public/floraBloom.png'
import floraGrow from '../public/floraGrow.png'
import floraMicro from '../public/floraMicro.png'

let images = [floraMicro, floraGrow, floraBloom, floraBloom]

let socket;

export default function PumpCard({ pump }) {
  const [lastValue, setLastValue] = useState(0);

  useEffect(() => {
    // socketInitializer();

    return () => socket && socket.close()
  }, []);

  const socketInitializer = async () => {
    socket = io("https://grow.mattdaisley.com:444/pumps");

    socket.on("reading", (msg) => {
      // console.log(msg);
      const msgJson = JSON.parse(msg);
      if (msgJson.sensor.id === sensor.id) {
        setLastValue(msgJson.value);
      }
    });
  };

  return (
    <Link href={`/pumps/${encodeURIComponent(pump.id)}`} key={pump.id}>
      <a className={styles.card + " " + styles.cardColumn}>
        <div style={{ width: 40 }}>
          <Image src={images[pump.index]} width={30} height={80} />
        </div>
        <div>
          <h2>
            {pump.name}
          </h2>
          <p>Index: {pump.index}</p>
          <p>Dose Rate: {pump.doseRate}</p>
        </div>
      </a>
    </Link>
  )
}