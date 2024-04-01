import SubscriptionsLayoutTemplate from "./SubscriptionsLayoutTemplate";

export default async function Layout({ params, children, ...props }) {
  console.log("Rendering Layout params:", params);

  let appKey: string = "";
  if (params.appKey !== undefined) {
    appKey = params.appKey;
  }

  return (
    <SubscriptionsLayoutTemplate appKey={appKey} {...props}>
      {children}
    </SubscriptionsLayoutTemplate>
  );
}
