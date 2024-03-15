
import { getApp } from './store/getApp';
import SubscriptionsLayoutTemplate from './SubscriptionsLayoutTemplate';

export default async function Layout({params, children, ...props}) {

  let appKey: string = '';
  if (params.appKey !== undefined) {
    appKey = params.appKey;
  }

  const app = await getApp(appKey);

  return <SubscriptionsLayoutTemplate app={app} {...props}>{children}</SubscriptionsLayoutTemplate>
}
