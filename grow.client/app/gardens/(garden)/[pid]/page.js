'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function GardenPage({ params }) {
  const gardenId = Number(params.pid);

  const router = useRouter();

  useEffect(() => {
    router.replace(`/gardens/${encodeURIComponent(gardenId)}/0`);
  }, [])

  return <div>Loading...</div>
}