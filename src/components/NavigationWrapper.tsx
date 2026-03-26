'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function NavigationWrapper() {
  const pathname = usePathname();
  const hideNav = ['/auth', '/privacy', '/terms', '/contact'];
  if (hideNav.some(p => pathname.startsWith(p))) return null;
  return <Navigation />;
}
