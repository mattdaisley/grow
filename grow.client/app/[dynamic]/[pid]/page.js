'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

export default function DynamicPage({ params }) {

  const router = useRouter();
  const pathname = usePathname();

  const pathnameKeys = pathname.split('/');

  const dynamicItemName = pathnameKeys[1]
  const id = Number(pathnameKeys[2])

  useEffect(() => {
    router.replace(`/${dynamicItemName}/${encodeURIComponent(id)}/0`);
  }, [])

  return <div>Loading...</div>
}