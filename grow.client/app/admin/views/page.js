'use client'

import useViews from '../hooks/useViews';

export default function AdminViewsPage() {

  const { allViews } = useViews()
  console.log(allViews)

  if (allViews?.item === undefined) {
    return null;
  }

  if (allViews?.item === null) {
    return <div>Unable to load items</div>;
  }

  // const dynamicItem = { item: { name: "Configuration" } };

  return null;
}