'use client';

import { useState } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation';

import styles from '../../../styles/Home.module.css'

export default function Pumps({ data }) {
  const searchParams = useSearchParams();
  const pid = searchParams.get('pid');

  const [amount, setAmount] = useState();

  const handleAmountChange = (event) => {
    console.log(event.target.value);
    setAmount(event.target.value);
  }

  const handleSend = () => {
    const data = {
      value: parseInt(amount),
    };

    fetch(`https://grow.mattdaisley.com:444/pumps/${pid}/command`, {
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
        <div className={styles.card}>
          <h2>{data.id}: {data.name}</h2>
          <p>Index: {data.index}</p>
          <p>Dose Rate: {data.doseRate}</p>
          <br />
          <h2>Send dose:</h2>
          <p><input onChange={handleAmountChange} type="number" min="0" step="1" /> ml</p>
          <p><button onClick={handleSend}>Send</button></p>
        </div>
      </div>
    </>
  )
}