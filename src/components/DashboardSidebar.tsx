'use client';
import {
  UserCog,
  ArrowLeftRight,
  LifeBuoy,
  Wallet,
  Copy,
  Package,
  DiamondPlus,
  CircleUserRound,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useSAMMStore } from '@/store/sammStore';
import { truncateAddress } from '@/helpers/truncate';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const SafeLinks = [
  { url: '/manage/members', title: 'Manage', icon: UserCog },
  { url: '/transactions/pending', title: 'Transactions', icon: ArrowLeftRight },
  { url: '/tx-helper', title: 'Tx Helper', icon: LifeBuoy },
];
const WebLinks = [
  { url: '/transactions/pending', title: 'Transactions', icon: ArrowLeftRight },
  { url: '/tx-helper', title: 'Tx Helper', icon: LifeBuoy },
];

export function DashboardSidebar({ isSafe }: { isSafe: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const handleCopy = useCopyToClipboard();

  const links = isSafe ? SafeLinks : WebLinks;
  const sammData = useSAMMStore((state) => state.sammData);
  const allSAMMs = useSAMMStore((state) => state.allSAMMs);
  const truncatedAddress = truncateAddress(sammData?.samm_address || '');

  function handleLogout() {
    localStorage.removeItem('currentSamm');
    localStorage.removeItem('userSamms');
    localStorage.removeItem('disabledSAMMs');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAuthenticated');
    if (isSafe) {
      router.replace('/owners-login');
    } else {
      router.replace('/');
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Wallet className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-xl leading-tight">
                <span className="truncate font-semibold">SAMM Wallet</span>
                <span className="truncate text-xs items-center flex">
                  SAMM address: {truncatedAddress}
                  <span
                    onClick={async () => {
                      await handleCopy(sammData?.samm_address || '');
                    }}
                  >
                    <Copy className="w-3 h-3 ml-1" />
                  </span>
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {links.map((item) => (
                <SidebarMenuItem key={item.title} className="data-[state=open]:px-2">
                  <SidebarMenuButton asChild className="py-5 text-lg font-medium">
                    <Link
                      className={cn(
                        'flex items-center',
                        pathname.includes(item.url) ? 'bg-background' : 'hover:bg-background'
                      )}
                      href={item.url}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isSafe && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-4">
                <SidebarMenuItem className="data-[state=open]:px-2">
                  <SidebarMenuButton asChild className="py-5 text-lg font-medium">
                    <Link className={'flex items-center hover:bg-background'} href="/create-module">
                      <DiamondPlus className="w-5 h-5" />
                      <span>Create new module</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-4">
          {allSAMMs.length > 1 && (
            <SidebarMenuItem className="data-[state=open]:px-2">
              <SidebarMenuButton asChild className="py-5 text-lg font-medium">
                <Link
                  className={cn(
                    'flex items-center',
                    pathname.includes('/modules') ? 'bg-background' : 'hover:bg-background'
                  )}
                  href="/modules"
                >
                  <Package className="w-5 h-5" />
                  <span>My Modules</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem className="data-[state=open]:px-2">
            <SidebarMenuButton className="py-5 text-lg font-medium" onClick={handleLogout}>
              <CircleUserRound className="w-5 h-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
