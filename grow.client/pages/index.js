import Link from 'next/link'
import styles from '../styles/Home.module.css'

function Home({ data }) {
  return (
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