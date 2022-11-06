import { useState } from 'react'
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

    fetch(`http://localhost:3001/pumps/${pid}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  return (
    <>
      <Link href={`/`}><a>&lt; Back</a></Link>
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

// This gets called on every request
export async function getServerSideProps({ params }) {
  // Fetch data from external API
  const res = await fetch(`http://localhost:3001/pumps/${params.pid}`)
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}

export default Pump;