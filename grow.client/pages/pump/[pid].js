import { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../../styles/Home.module.css'

function Pump({ data }) {
  const router = useRouter()
  const { pid } = router.query

  const [amount, setAmount] = useState();

  const handleAmountChange = (event) => {
    console.log(event.target.value);
    setAmount(event.target.value);
  }

  const handleSend = () => {
    const data = {
      value: parseInt(amount),
    };

    fetch(`http://pi-mower:3001/pumps/${pid}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Grow App - Pump {pid}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>{data.name}</h2>
            <p>Index: {data.index}</p>
            <p>Dose Rate: {data.doseRate}</p>
            <input onChange={handleAmountChange} type="number" min="0" step="1" />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

// This gets called on every request
export async function getServerSideProps({ params }) {
  // Fetch data from external API
  const res = await fetch(`http://localhost:3001/pumps/${params.pid}`)
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}

export default Pump;