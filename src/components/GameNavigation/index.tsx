'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '../../store/gameStore';
import { CITIES, RANKS } from '../../types/constants';

const GameNavigation = () => {
  const pathname = usePathname();
  const { player, logout } = useGameStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!player) return null;

  const currentCity = CITIES[player.city];
  const currentRank = RANKS[player.rank];

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/crimes', label: 'Crimes', icon: '💰' },
    { path: '/travel', label: 'Travel', icon: '✈️' },
    { path: '/garage', label: 'Garage', icon: '🚗' },
    { path: '/store', label: 'Store', icon: '🏪' },
    { path: '/shoot', label: 'Shoot', icon: '🎯' },
  ];

  const isActivePath = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    localStorage.removeItem('auth_token');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <span className="text-2xl">🎭</span>
              <span className="font-bold text-xl text-red-500">MAFIOSO</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Player Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{player.username}</div>
              <div className="text-xs text-gray-400">
                {currentRank.name} in {currentCity.name}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-green-400 font-mono font-bold">
                ${player.money.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                {player.respect.toLocaleString()} respect
              </div>
            </div>

            <div className="text-right">
              <div className="text-white font-semibold">
                {player.bullets}
              </div>
              <div className="text-xs text-gray-400">bullets</div>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors p-2"
              title="Logout"
            >
              🚪
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-700">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath(item.path)
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            
            <div className="border-t border-gray-600 pt-3 mt-3">
              <div className="px-3 py-2">
                <div className="text-white font-medium">{player.username}</div>
                <div className="text-sm text-gray-400">
                  {currentRank.name} in {currentCity.name}
                </div>
                <div className="text-green-400 font-mono font-bold mt-1">
                  ${player.money.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  {player.respect.toLocaleString()} respect • {player.bullets} bullets
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default GameNavigation;