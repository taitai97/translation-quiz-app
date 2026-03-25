'use client';

import { useEffect, useState } from 'react';
import Navigation from './Navigation';
import { getDueCards } from '@/lib/storage';

export default function NavigationWrapper() {
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    getDueCards().then(cards => setDueCount(cards.length)).catch(() => {});
  }, []);

  return <Navigation dueCount={dueCount} />;
}
