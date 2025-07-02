
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, MessageCircle, Heart, Target, Sparkles, Settings, TestTube } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navigationItems = [
    { name: t('nav.home'), href: '/', icon: Home, current: location.pathname === '/' },
    { name: t('nav.coach'), href: '/coach', icon: MessageCircle, current: location.pathname === '/coach' },
    { name: t('nav.spiritualGrowth'), href: '/spiritual-growth', icon: Heart, current: location.pathname === '/spiritual-growth' },
    { name: 'Dreams', href: '/dreams', icon: Target, current: location.pathname === '/dreams' },
    { name: t('nav.blueprint'), href: '/blueprint', icon: Sparkles, current: location.pathname === '/blueprint' },
    { name: 'Diagnostics', href: '/diagnostics', icon: TestTube, current: location.pathname === '/diagnostics' },
  ];

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="text-xl font-bold">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <span className="gradient-text">SoulSync</span>
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`text-gray-600 hover:text-gray-900 transition-colors duration-200 ${item.current ? 'font-semibold' : ''}`}
          >
            {item.name}
          </Link>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>User Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navigation;
