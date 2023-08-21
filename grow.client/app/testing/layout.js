import { DynamicTestingLayout } from "./[dynamic]/DynamicTestingLayout";
import { getNavigationPages } from "./[dynamic]/getNavigationPages";

export default async function ConfigurationLayout({ children }) {

  const pages = await getNavigationPages()

  return (
    <DynamicTestingLayout pages={pages}>{children}</DynamicTestingLayout>
  )
}

