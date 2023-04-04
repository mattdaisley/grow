import { getNavigationPages } from './testing/getNavigationPages';

import '../styles/globals.css'
import { AppLayout } from './AppLayout';


export default async function Layout({ children }) {

  const pages = await getNavigationPages()

  return (
    <AppLayout pages={pages}>{children}</AppLayout>
  )
}

