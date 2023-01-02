'use client';

import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation';

import styles from '../../../styles/Home.module.css'
import outletImage from '../../../public/outlet.png'

export default function Outlets({ data }) {

  const searchParams = useSearchParams();
  const pid = searchParams.get('pid');

  const [status, setStatus] = useState(data.status);

  const toggleStatus = (event) => {
    const newStatus = status === 0 ? 1 : 0;
    setStatus(status === 0 ? 1 : 0);
    handleSend(newStatus);
  }

  const handleSend = (newStatus) => {
    const data = {
      value: parseInt(newStatus),
    };

    fetch(`https://grow.mattdaisley.com:444/outlets/${pid}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  return (
    <>
      <Link href={`/`}>&lt; Back</Link>
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.cardCenter}`}>
          <Image src={outletImage} width={80} height={80} alt="outlet" />
          <h2>{data.name}</h2>
          <p>Index: {data.index}</p>
          <p>Status: {status === 0 ? "off" : "on"}</p>
          <p>
            {status === 1
              ? <button onClick={toggleStatus}>Turn Off</button>
              : <button onClick={toggleStatus}>Turn On</button>
            }
          </p>
        </div>
      </div>
    </>
  )
}
