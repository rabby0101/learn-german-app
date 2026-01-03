import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import SchoolIcon from '@mui/icons-material/School';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  authRequired?: boolean;
}

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

const Header: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: 'Learn',
      icon: '📚',
      items: [
        { path: '/', label: 'Vocabulary', icon: '📚' },
        { path: '/grammar', label: 'Grammar', icon: '📝' },
      ],
    },
    {
      label: 'Practice',
      icon: '🎯',
      items: [
        { path: '/reading', label: 'Reading', icon: '📖' },
        { path: '/writing', label: 'Writing', icon: '✍️' },
        { path: '/listening', label: 'Listening', icon: '🎧' },
        { path: '/speaking', label: 'Speaking', icon: '🎤' },
      ],
    },
    {
      label: 'Progress',
      icon: '📊',
      items: [
        { path: '/learning-path', label: 'Learning Path', icon: '🗺️' },
        { path: '/goals', label: 'Goals', icon: '🎯' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊', authRequired: true },
      ],
    },
    {
      label: 'Model Test',
      icon: '🎓',
      items: [
        { path: '/model-test/a1', label: 'A1 Model Test', icon: '🅰️' },
        { path: '/model-test/a2', label: 'A2 Model Test', icon: '🔤' },
        { path: '/model-test/b1', label: 'B1 Model Test', icon: '🔷' },
        { path: '/model-test/b2', label: 'B2 Model Test', icon: '🔶' },
        { path: '/model-test/c1', label: 'C1 Model Test', icon: '💎' },
        { path: '/model-test/c2', label: 'C2 Model Test', icon: '👑' },
      ],
    },
  ];

  const getAvatarInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const isGroupActive = (group: NavGroup): boolean => {
    return group.items.some(item => item.path === location.pathname);
  };

  return (
    <header className="sticky top-0 z-[1000] bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-8 h-16 max-w-[1400px] mx-auto">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <div className="mr-3 p-2 rounded-lg bg-emerald-500">
            <SchoolIcon className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Learn German
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navGroups.map((group) => {
                const isActive = isGroupActive(group);
                const visibleItems = group.items.filter(
                  item => !item.authRequired || currentUser
                );

                if (visibleItems.length === 0) return null;

                return (
                  <NavigationMenuItem key={group.label}>
                    <NavigationMenuTrigger
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <span className="text-base">{group.icon}</span>
                      <span className="hidden sm:inline">{group.label}</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-52 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                        {visibleItems.map((item) => (
                          <li key={item.path}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={item.path}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                  location.pathname === item.path
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                              >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-200 mx-2" />

          {/* User Authentication Section */}
          <div className="shrink-0">
            {currentUser ? (
              <Button
                onClick={() => setProfileModalOpen(true)}
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#10b981',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {getAvatarInitial(currentUser.name)}
                </Avatar>
                <span className="hidden sm:inline font-medium text-sm">
                  {currentUser.name}
                </span>
              </Button>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline font-medium text-sm">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <UserProfile
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  );
};

export default Header;