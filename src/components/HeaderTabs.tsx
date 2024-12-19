'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Users, TriangleAlert, Settings, LayoutList, ListChecks } from 'lucide-react';

interface HeaderTabsProps {
  tabType: 'manage' | 'tx';
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ tabType }) => {
  const pathname = usePathname();

  const tabs =
    tabType === 'manage'
      ? [
          { name: 'Members', href: '/manage/members', icon: Users },
          { name: 'Restrictions', href: '/manage/restrictions', icon: TriangleAlert },
          { name: 'Settings', href: '/manage/settings', icon: Settings },
        ]
      : [
          { name: 'Pending', href: '/transactions/pending', icon: LayoutList },
          { name: 'Confirmed', href: '/transactions/confirmed', icon: ListChecks },
        ];

  return (
    <header className="flex flex-col lg:flex-row space-y-4 lg:space-x-16 lg:space-y-0 bg-samm-white justify-center rounded-md m-8 mt-2 p-4">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
          className={cn(
            'py-2 px-10 font-medium flex rounded justify-center',
            pathname === tab.href ? 'bg-samm-black text-samm-white' : 'bg-background'
          )}
        >
          <tab.icon className="mr-3 w-5 h-5" />
          {tab.name}
        </Link>
      ))}
    </header>
  );
};

export default HeaderTabs;
