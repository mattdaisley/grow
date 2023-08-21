import '../styles/globals.css'
import { AppLayout } from './AppLayout';


export default async function Layout({ children }) {

  return (
    <AppLayout>{children}</AppLayout>
  )
}

