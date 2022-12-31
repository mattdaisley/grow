
import styles from '../styles/Home.module.css'
import Footer from './footer'
import ResponsiveAppBar from './ResponsiveAppBar'

export default function Layout({ children }) {
  return (
    <div className={styles.container}>

      <ResponsiveAppBar />

      <main className={styles.main}>
        {children}
      </main>

      <Footer />
    </div>
  )
}