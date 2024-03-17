import { getApp } from "../store/getApp";
import SubscriptionsTemplate from "./SubscriptionsTemplate";

export default async function Page({ params }) {
  console.log("Rendering Page");

  let appKey: string = "";
  if (params.appKey !== undefined) {
    appKey = params.appKey;
  }

  const app = await getApp(appKey);
  // console.log(app);

  // let filter = params.filter?.[0];
  // if (filter === undefined) {
  //   if (Object.keys(pages).length > 0) {
  //     filter = Object.keys(pages)[0];
  //   }
  // }

  // console.log('DynamicPage', 'filter:', filter, 'itemKeys:', itemKeys, 'pages:', pages)

  return (
    <>
      <SubscriptionsTemplate appKey={appKey} />
    </>
  );
}

