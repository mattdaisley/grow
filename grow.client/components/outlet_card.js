import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import Link from 'next/link'
import Image from 'next/image'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';

import styles from '../styles/Home.module.css'
import outletImage from '../public/outlet.png'

let socket;

export default function OutletCard({ outlet }) {
  const [status, setStatus] = useState(outlet.status);

  useEffect(() => {
    // socketInitializer();

    return () => socket && socket.close()
  }, []);

  const socketInitializer = async () => {
    socket = io("https://grow.mattdaisley.com:444/outlets");

    socket.on("reading", (msg) => {
      // console.log(msg);
      const msgJson = JSON.parse(msg);
      if (msgJson.outlet.id === outlet.id) {
        setStatus(msgJson.value);
      }
    });
  };

  return (
    <Grid xs={3}>
      <Card>
        <CardContent>
          <Link href={`/outlets/${encodeURIComponent(outlet.id)}`} key={outlet.id}>
            <Image src={outletImage} width={60} height={60} alt="outlet" />
            <h2>{outlet.name}</h2>
            <p>Index: {outlet.index}</p>
            <p>Status: {status === 0 ? "off" : "on"}</p>
          </Link>
        </CardContent>
      </Card>
    </Grid>
  )
}