import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Footer from './footer'

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Grow App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {children}
      </main>

      <Footer />
    </div>
  )
}