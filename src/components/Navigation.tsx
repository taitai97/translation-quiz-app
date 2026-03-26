'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages, History, ListChecks, BookOpen, Settings } from 'lucide-react';

const navItems = [
  { href: '/', icon: Languages, label: '翻訳' },
  { href: '/history', icon: History, label: '履歴' },
  { href: '/studylist', icon: ListChecks, label: '学習リスト' },
  { href: '/quiz', icon: BookOpen, label: 'フラッシュカード' },
  { href: '/settings', icon: Settings, label: '設定' },
];

interface NavigationProps {
  dueCount?: number;
}

export default function Navigation({ dueCount = 0 }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center w-full max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const isQuiz = href === '/quiz';
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-3 px-3 min-w-0 flex-1 relative transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                {isQuiz && dueCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 truncate font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
