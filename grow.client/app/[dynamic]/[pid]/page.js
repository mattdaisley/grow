'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';

export default function DynamicPage({ params }) {

  const router = useRouter();
  const pathname = usePathname();

  const pathnameKeys = pathname.split('/');

  const dynamicItemName = pathnameKeys[1]
  const id = Number(pathnameKeys[2])

  useEffect(() => {
    router.replace(`/${dynamicItemName}/${encodeURIComponent(id)}/0`);
  }, [])

  return <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>Loading...</Box>;
}