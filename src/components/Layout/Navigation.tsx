import React from 'react';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Heart, Target, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { useResponsive } from '@/hooks/use-responsive';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const currentPath = usePathname() || '';
  const { signOut, user } = useAuth();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();

  const navigationItems = [
    { name: t('nav.home'), href: '/', icon: Home, current: currentPath === '/' },
    { name: t('nav.coach'), href: '/coach', icon: MessageCircle, current: currentPath === '/coach' },
    { name: t('nav.spiritualGrowth'), href: '/spiritual-growth', icon: Heart, current: currentPath === '/spiritual-growth' },
    { name: t('nav.productivity'), href: '/productivity', icon: Target, current: currentPath === '/productivity' },
    { name: t('nav.blueprint'), href: '/blueprint', icon: Sparkles, current: currentPath === '/blueprint' },
    { name: 'Diagnostics', href: '/diagnostics', icon: Settings, current: currentPath === '/diagnostics' },
  ];

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="text-xl font-bold">
        <a href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <span className="gradient-text">SoulSync</span>
        </a>
      </div>

      {isMobile ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navigationItems.map((item) => (
              <DropdownMenuItem key={item.name} onClick={() => window.location.href = item.href}>
                {item.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>{t('nav.signOut')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center space-x-6">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-gray-600 hover:text-gray-900 transition-colors duration-200 ${item.current ? 'font-semibold' : ''}`}
            >
              {item.name}
            </a>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>{t('nav.signOut')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
