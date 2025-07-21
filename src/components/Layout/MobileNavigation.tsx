
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, User, MessageCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNavigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navigationItems = [
    {
      name: 'Blueprint',
      href: '/blueprint',
      icon: Home,
    },
    {
      name: 'Coach',
      href: '/coach',
      icon: MessageCircle,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Analysis',
      href: '/design-analysis',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border-default md:hidden">
      <div className="flex justify-around items-center padding-sm">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center padding-sm rounded-lg transition-colors min-w-[60px]',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-text-secondary hover:text-primary hover:bg-surface-elevated'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1', isActive ? 'text-primary' : 'text-text-secondary')} />
              <span className={cn('text-caption-xs font-inter', isActive ? 'text-primary' : 'text-text-secondary')}>
                {item.name}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
