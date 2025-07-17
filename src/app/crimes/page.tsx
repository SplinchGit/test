'use client';

import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CRIMES, RANKS } from '../../types/constants';
import GameNavigation from '../../components/GameNavigation';
import Link from 'next/link';
import type { CrimeType } from '../../types/constants';
import type { CrimeResult } from '../../types/game';

export default function Crimes() {
  const { player, commitCrime, isLoading } = useGameStore();
  const [crimeResult, setCrimeResult] = useState<CrimeResult | null>(null);

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

  const currentRank = RANKS[player.rank];
  const availableCrimes = CRIMES.filter(crime => crime.requiredRank <= player.rank);

  const handleCommitCrime = async (crimeId: number) => {
    if (!player) return;

    const result = await commitCrime(crimeId);
    if (result) {
      setCrimeResult(result);
    }
  };

  const getCrimeSuccessChance = (crime: CrimeType) => {
    // Fixed success rate from crime definition
    return crime.baseSuccess;
  };

  const canCommitCrime = () => {
    if (useGameStore.getState().isInJail() || useGameStore.getState().isInHospital()) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameNavigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">💰 Crimes</h1>
            <p className="text-gray-400 text-lg">
              Choose your next criminal activity
            </p>
          </div>

          {/* Player Status */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-yellow-400 text-xl font-bold">{currentRank.name}</div>
                <div className="text-gray-400 text-sm">Current Rank</div>
              </div>
              <div>
                <div className="text-green-400 text-xl font-bold">
                  ${player.money.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Cash on Hand</div>
              </div>
            </div>
          </div>

          {/* Crime Result Modal */}
          {crimeResult && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">
                  {crimeResult.success ? '✅ Success!' : '❌ Failed!'}
                </h3>
                
                <p className="text-white mb-4">{crimeResult.message}</p>
                
                {crimeResult.success && (
                  <div className="space-y-2 mb-4">
                    {crimeResult.moneyGained && (
                      <div className="flex justify-between">
                        <span>Money Gained:</span>
                        <span className="text-green-400 font-bold">
                          +${crimeResult.moneyGained.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {crimeResult.respectGained && (
                      <div className="flex justify-between">
                        <span>Respect Gained:</span>
                        <span className="text-yellow-400 font-bold">
                          +{crimeResult.respectGained}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {(crimeResult.jailTime || crimeResult.hospitalTime) && (
                  <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-4">
                    <p className="text-red-400 text-sm">
                      {crimeResult.jailTime && `Jailed for ${Math.round(crimeResult.jailTime / 60)} minutes`}
                      {crimeResult.hospitalTime && `Hospitalized for ${Math.round(crimeResult.hospitalTime / 60)} minutes`}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setCrimeResult(null)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold w-full"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Available Crimes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCrimes.map((crime) => {
              const canCommit = canCommitCrime();
              const successChance = getCrimeSuccessChance(crime);
              
              return (
                <div 
                  key={crime.id} 
                  className={`bg-gray-800 p-6 rounded-lg border border-gray-700 hover:shadow-xl transition-all duration-300 ${
                    !canCommit ? 'opacity-50' : 'hover:scale-105'
                  }`}
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{crime.name}</h3>
                    <p className="text-gray-400 text-sm">{crime.description}</p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="text-white font-semibold">{Math.round(successChance)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payout:</span>
                      <span className="text-green-400 font-semibold">
                        ${crime.basePayout.min.toLocaleString()} - ${crime.basePayout.max.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Respect:</span>
                      <span className="text-yellow-400 font-semibold">+{crime.baseRespect}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cooldown:</span>
                      <span className="text-white font-semibold">
                        {Math.round(crime.cooldown / 60)} min
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCommitCrime(crime.id)}
                    disabled={!canCommit || isLoading}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      canCommit && !isLoading
                        ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Committing...' : 'Commit Crime'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Locked Crimes */}
          {CRIMES.filter(crime => crime.requiredRank > player.rank).length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-red-500 mb-6">🔒 Locked Crimes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CRIMES.filter(crime => crime.requiredRank > player.rank).map((crime) => {
                  const requiredRank = RANKS[crime.requiredRank];
                  
                  return (
                    <div key={crime.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 opacity-50">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">{crime.name}</h3>
                        <p className="text-gray-400 text-sm">{crime.description}</p>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Required Rank:</span>
                          <span className="text-red-500 font-semibold">{requiredRank.name}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Payout:</span>
                          <span className="text-green-400 font-semibold">
                            ${crime.basePayout.min.toLocaleString()} - ${crime.basePayout.max.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Respect:</span>
                          <span className="text-yellow-400 font-semibold">+{crime.baseRespect}</span>
                        </div>
                      </div>

                      <div className="bg-gray-700 text-center py-2 rounded">
                        <span className="text-gray-400 text-sm">
                          Unlock at {requiredRank.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}