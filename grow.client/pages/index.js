import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

function Home({ data }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Grow App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        <div className={styles.grid}>
          {data.map(pump => {
            return (
              <Link href={`/pump/${encodeURIComponent(pump.id)}`} key={pump.id}>
                <a className={styles.card}>
                  <h2>{pump.id}: {pump.name}</h2>
                  <p>Index: {pump.index}</p>
                  <p>Dose Rate: {pump.doseRate}</p>
                </a>
              </Link>
            )
          })}
        </div>
      </main>

      <footer className={styles.footer}>
        Grow!
      </footer>
    </div>
  )
}

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`http://localhost:3001/pumps`)
  const data = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}

export default Home;