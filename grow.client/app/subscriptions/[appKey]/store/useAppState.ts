import { useContext } from "react";
import { SubscriptionStoreContext } from "./SubscriptionStoreContext";

export default function useAppState() {
  const app = useContext(SubscriptionStoreContext);

  return app?.state ?? {};
}