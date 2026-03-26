'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages, History, BookOpen, Settings } from 'lucide-react';

const navItems = [
  { href: '/', icon: Languages, label: '翻訳' },
  { href: '/history', icon: History, label: '履歴' },
  { href: '/quiz', icon: BookOpen, label: 'クイズ' },
  { href: '/settings', icon: Settings, label: '設定' },
];

interface NavigationProps {
  dueCount?: number;
}

export default function Navigation({ dueCount = 0 }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const isQuiz = href === '/quiz';
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-4 min-w-0 flex-1 relative ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {isQuiz && dueCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-0.5 truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
