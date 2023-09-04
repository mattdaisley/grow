import { DynamicTestingLayout } from "./DynamicTestingLayout";
import { getNavigationPages } from "./getNavigationPages";

export default async function ConfigurationLayout(props) {

  let { params, children } = props;

  let appKey;
  if (params.dynamic !== undefined) {
    appKey = params.dynamic
  }
  const pages = await getNavigationPages(appKey)

  return (
    <DynamicTestingLayout pages={pages} appKey={appKey}>{children}</DynamicTestingLayout>
  )
}

