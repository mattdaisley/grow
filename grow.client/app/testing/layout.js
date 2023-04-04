import { DynamicTestingLayout } from "./DynamicTestingLayout";
import { getNavigationPages } from "./getNavigationPages";

export default async function ConfigurationLayout({ children }) {

  const pages = await getNavigationPages()

  // console.log(params)
  return (
    <DynamicTestingLayout pages={pages}>{children}</DynamicTestingLayout>
  )
}

