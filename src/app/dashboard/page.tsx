'use client';

import { useGameStore } from '../../store/gameStore';
import { CITIES, RANKS, CARS } from '../../types/constants';
import GameNavigation from '../../components/GameNavigation';
import Link from 'next/link';

export default function Dashboard() {
  const { player } = useGameStore();

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

  const currentCity = CITIES[player.city];
  const currentRank = RANKS[player.rank];
  const nextRank = RANKS[player.rank + 1];
  const playerCar = player.activeCar ? CARS[player.cars.find(c => c.id === player.activeCar)?.carType || 0] : null;

  const rankProgress = nextRank 
    ? (player.respect / nextRank.requiredRespect) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameNavigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">
              Welcome back, {player.username}
            </h1>
            <p className="text-gray-400 text-lg">
              {currentRank.name} operating in {currentCity.name} {currentCity.flag}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Money Card */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">💰 Cash</h3>
                  <p className="text-green-400 text-2xl font-mono font-bold">
                    ${player.money.toLocaleString()}
                  </p>
                </div>
                <div className="text-4xl opacity-50">💵</div>
              </div>
            </div>

            {/* Respect Card */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <h3 className="text-lg font-semibold text-white mb-2">⭐ Respect</h3>
                  <p className="text-yellow-400 text-2xl font-bold">
                    {player.respect.toLocaleString()}
                  </p>
                  {nextRank && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-400 mb-1">
                        Progress to {nextRank.name}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(rankProgress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(nextRank.requiredRespect - player.respect).toLocaleString()} more needed
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-4xl opacity-50">👑</div>
              </div>
            </div>

            {/* Bullets Card */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">🔫 Bullets</h3>
                  <p className="text-red-400 text-2xl font-bold">
                    {player.bullets}
                  </p>
                </div>
                <div className="text-4xl opacity-50">💥</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Status */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-red-500 mb-4">🎯 Current Status</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rank:</span>
                  <span className="text-white font-semibold">{currentRank.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white font-semibold">
                    {currentCity.name} {currentCity.flag}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Vehicle:</span>
                  <span className="text-white font-semibold">
                    {playerCar ? playerCar.name : 'None'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Crimes Committed:</span>
                  <span className="text-white font-semibold">
                    {player.stats.crimesCommitted}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-white font-semibold">
                    {player.stats.crimesCommitted > 0 
                      ? Math.round((player.stats.crimesSuccessful / player.stats.crimesCommitted) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-red-500 mb-4">⚡ Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/crimes" 
                  className="bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-lg font-medium hover:scale-105 transform transition-all"
                >
                  💰 Commit Crime
                </Link>
                
                <Link 
                  href="/travel" 
                  className="bg-gray-600 hover:bg-gray-700 text-white text-center py-3 rounded-lg font-medium hover:scale-105 transform transition-all"
                >
                  ✈️ Travel
                </Link>
                
                <Link 
                  href="/garage" 
                  className="bg-gray-600 hover:bg-gray-700 text-white text-center py-3 rounded-lg font-medium hover:scale-105 transform transition-all"
                >
                  🚗 Garage
                </Link>
                
                <button 
                  className="bg-gray-600 text-gray-400 py-3 rounded-lg font-medium cursor-not-allowed"
                  disabled
                >
                  👥 Gang (Soon)
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 text-center">
                  💡 Tip: Higher ranks unlock more profitable crimes!
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-red-500 mb-4">📈 Statistics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ${player.stats.totalMoneyEarned.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Total Earned</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {player.stats.totalRespectEarned.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Total Respect</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {player.stats.timesJailed}
                  </div>
                  <div className="text-xs text-gray-400">Times Jailed</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {player.stats.rankUps}
                  </div>
                  <div className="text-xs text-gray-400">Rank Ups</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}