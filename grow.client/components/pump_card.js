'use client';

import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";

import Link from 'next/link'
import Image from 'next/image'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';

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
    <Grid xs={3}>
      <Card>
        <CardContent>
          <Link href={`/pumps/${encodeURIComponent(pump.id)}`} key={pump.id}>
            <div style={{ width: 40 }}>
              <Image src={images[pump.index]} width={30} height={80} alt={pump.name} />
            </div>
            <div>
              <h2>
                {pump.name}
              </h2>
              <p>Index: {pump.index}</p>
              <p>Dose Rate: {pump.doseRate}</p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </Grid>
  )
}