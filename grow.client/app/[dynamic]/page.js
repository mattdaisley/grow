'use client'

import { usePathname } from "next/navigation"

export default function DynamicPage() {
  const pathname = usePathname();
  console.log(pathname)
  return <div>hello</div>
}