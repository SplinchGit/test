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
                  {player.kills > 0 ? (player.kills / (player.kills + player.deaths) * 100).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>

          {/* Current Search Status */}
          {player?.searchingFor && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">🔍 Current Search</h2>
              
              {isSearching && (
                <div className="text-center">
                  <div className="text-lg text-white mb-2">
                    Searching for: <span className="font-bold text-red-400">{player.searchingFor.targetUsername}</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-yellow-400 mb-4">
                    {formatTime(searchTimeLeft)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${100 - (searchTimeLeft / (3 * 60 * 60 * 1000)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <button
                    onClick={handleCancelSearch}
                    disabled={isLoading}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-semibold"
                  >
                    Cancel Search
                  </button>
                </div>
              )}

              {isSearchComplete && (
                <div className="text-center">
                  <div className="text-lg text-green-400 mb-4">
                    ✅ Found: <span className="font-bold">{player.searchingFor.targetUsername}</span>
                  </div>
                  <div className="text-gray-400 mb-4">
                    Target is in {player.searchingFor.targetCity !== undefined ? 
                      `City ${player.searchingFor.targetCity}` : 'Unknown Location'}
                  </div>
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={handleShoot}
                      disabled={isLoading || player.bullets === 0}
                      className={`py-3 px-6 rounded-lg font-semibold ${
                        player.bullets > 0 && !isLoading
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {player.bullets === 0 ? 'No Bullets' : isLoading ? 'Shooting...' : '🔫 Shoot'}
                    </button>
                    <button
                      onClick={handleCancelSearch}
                      disabled={isLoading}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Form */}
          {!player?.searchingFor && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">🔍 Find Target</h2>
              
              <form onSubmit={handleSearch}>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    placeholder="Enter player username..."
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !targetUsername.trim()}
                    className={`py-3 px-6 rounded-lg font-semibold ${
                      !isLoading && targetUsername.trim()
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              
              <div className="mt-4 text-sm text-gray-400">
                <p>Search takes 3 hours. You can only search for one player at a time.</p>
              </div>
            </div>
          )}

          {/* Combat Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold text-red-500 mb-4">🎯 How Combat Works</h3>
              <div className="space-y-2 text-sm">
                <p className="text-white">
                  • Search for players by username (3 hours)
                </p>
                <p className="text-white">
                  • Shooting costs bullets based on target&apos;s protection
                </p>
                <p className="text-white">
                  • Successful kills steal all target&apos;s cars
                </p>
                <p className="text-white">
                  • Target players reset but keep swiss bank money
                </p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold text-red-500 mb-4">💡 Combat Tips</h3>
              <div className="space-y-2 text-sm">
                <p className="text-white">
                  • Buy better guns to reduce bullet costs
                </p>
                <p className="text-white">
                  • Target players with expensive cars
                </p>
                <p className="text-white">
                  • Store money in swiss bank before engaging
                </p>
                <p className="text-white">
                  • Consider target&apos;s protection level
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold text-red-500 mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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