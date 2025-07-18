'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import GameNavigation from '../../components/GameNavigation';
import Link from 'next/link';

export default function Shoot() {
  const { player, searchPlayer, shootPlayer, cancelSearch, isLoading } = useGameStore();
  const [targetUsername, setTargetUsername] = useState('');
  const [searchTimeLeft, setSearchTimeLeft] = useState(0);

  // Calculate search time remaining
  useEffect(() => {
    if (player?.searchingFor && player.searchingFor.searchEndTime) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const endTime = new Date(player.searchingFor!.searchEndTime).getTime();
        const timeLeft = Math.max(0, endTime - now);
        setSearchTimeLeft(timeLeft);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [player?.searchingFor]);

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to access the game.</p>
          <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;
    
    await searchPlayer(targetUsername.trim());
    setTargetUsername('');
  };

  const handleShoot = async () => {
    await shootPlayer();
  };

  const handleCancelSearch = async () => {
    await cancelSearch();
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const isSearchComplete = player?.searchingFor && searchTimeLeft === 0;
  const isSearching = player?.searchingFor && searchTimeLeft > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameNavigation />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">🎯 Shoot</h1>
            <p className="text-gray-400 text-lg">
              Hunt down other players for respect and their cars
            </p>
          </div>

          {/* Player Combat Stats */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Combat Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{player.bullets}</div>
                <div className="text-sm text-gray-400">Bullets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{player.kills}</div>
                <div className="text-sm text-gray-400">Kills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{player.deaths}</div>
                <div className="text-sm text-gray-400">Deaths</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {player.kills > 0 ? (player.kills / Math.max(player.deaths, 1)).toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-gray-400">K/D Ratio</div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🔍 Search for Target</h2>
            
            {!player.searchingFor ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Enter target username
                  </label>
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Target username..."
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !targetUsername.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔍 Search Player
                </button>
              </form>
            ) : isSearching ? (
              <div className="text-center space-y-4">
                <div className="text-xl font-bold text-yellow-400">
                  ⏳ Searching for {player.searchingFor.targetUsername}...
                </div>
                <div className="text-3xl font-mono text-white">
                  {formatTime(searchTimeLeft)}
                </div>
                <p className="text-gray-400">
                  Detectives are tracking down your target
                </p>
                <button
                  onClick={handleCancelSearch}
                  disabled={isLoading}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel Search
                </button>
              </div>
            ) : isSearchComplete ? (
              <div className="space-y-4">
                <div className="bg-green-900/50 p-4 rounded-lg border border-green-600">
                  <h3 className="text-lg font-bold text-green-400 mb-2">
                    ✅ Target Found!
                  </h3>
                  <p className="text-white">
                    <strong>{player.searchingFor.targetUsername}</strong> is currently in {' '}
                    {player.searchingFor.targetCity !== undefined ? `City ${player.searchingFor.targetCity}` : 'an unknown location'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleShoot}
                    disabled={isLoading || player.bullets === 0}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔫 Shoot Target ({player.bullets} bullets)
                  </button>
                  <button
                    onClick={handleCancelSearch}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/store" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold"
              >
                🔫 Buy Guns
              </Link>
              <Link 
                href="/store" 
                className="bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold"
              >
                🛡️ Buy Protection
              </Link>
              <Link 
                href="/crimes" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-center py-3 rounded-lg font-semibold"
              >
                💰 Get Money
              </Link>
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
                disabled
              >
                🏦 Swiss Bank
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}