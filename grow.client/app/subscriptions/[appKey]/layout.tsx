
import { getApp } from './store/getApp';
import SubscriptionsLayoutTemplate from './SubscriptionsLayoutTemplate';

export default async function Layout({params, children, ...props}) {
  console.log('Rendering Layout')

  let appKey: string = '';
  if (params.appKey !== undefined) {
    appKey = params.appKey;
  }

  const app = await getApp(appKey);

  if (app === undefined) {
    return null;
  }

  return <SubscriptionsLayoutTemplate app={app} {...props}>{children}</SubscriptionsLayoutTemplate>
}
