'use client'

import usePages from '../hooks/usePages';

export default function AdminPagesPage() {

  const { allPages } = usePages()
  console.log(allPages)

  if (allPages?.item === undefined) {
    return null;
  }

  if (allPages?.item === null) {
    return <div>Unable to load items</div>;
  }

  // const dynamicItem = { item: { name: "Configuration" } };

  return null;
}