'use client'

import useFields from '../hooks/useFields';

export default function AdminFieldsPage() {

  const { allFields } = useFields()
  console.log(allFields)

  if (allFields?.item === undefined) {
    return null;
  }

  if (allFields?.item === null) {
    return <div>Unable to load items</div>;
  }

  // const dynamicItem = { item: { name: "Configuration" } };

  return null;
}