
import { getNavigationPages } from '../app/testing/getNavigationPages'
import styles from '../styles/Home.module.css'
import Footer from './footer'
import ResponsiveAppBar from './ResponsiveAppBar'

export default async function Layout({ children }) {

  const pages = await getNavigationPages()

  return (
    <div className={styles.container}>

      <ResponsiveAppBar pages={pages} />

      <main className={styles.main}>
        {children}
      </main>

      <Footer />
    </div>
  )
}