'use client';

import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CITIES, GAME_CONFIG } from '../../types/constants';
import GameNavigation from '../../components/GameNavigation';
import Link from 'next/link';

export default function Travel() {
  const { player, travel, isLoading } = useGameStore();
  const [selectedCity, setSelectedCity] = useState<number | null>(null);

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
  const availableCities = CITIES.filter((_, index) => index !== player.city);

  const getTravelCost = () => {
    // Simple calculation - could be more complex based on distance
    return GAME_CONFIG.TRAVEL_COST_BASE;
  };

  const handleTravel = async () => {
    if (selectedCity === null) return;
    
    const success = await travel(selectedCity);
    if (success) {
      setSelectedCity(null);
    }
  };

  const canAffordTravel = (cost: number) => {
    return player.money >= cost;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameNavigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">✈️ Travel</h1>
            <p className="text-gray-400 text-lg">
              Expand your criminal empire to new cities
            </p>
          </div>

          {/* Current Location */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Current Location</h2>
              <div className="text-6xl mb-4">{currentCity.flag}</div>
              <h3 className="text-3xl font-bold text-yellow-400">{currentCity.name}</h3>
              <p className="text-gray-400 mt-2">
                You&apos;re currently operating from {currentCity.name}
              </p>
            </div>
          </div>

          {/* Available Destinations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Choose Destination</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableCities.map((city) => {
                const travelCost = getTravelCost();
                const canAfford = canAffordTravel(travelCost);
                
                return (
                  <div
                    key={city.id}
                    className={`bg-gray-800 p-6 rounded-lg border border-gray-700 cursor-pointer transition-all duration-300 ${
                      selectedCity === city.id
                        ? 'ring-2 ring-red-500 scale-105'
                        : 'hover:scale-105 hover:shadow-xl'
                    } ${
                      !canAfford ? 'opacity-50' : ''
                    }`}
                    onClick={() => canAfford && setSelectedCity(city.id)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">{city.flag}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{city.name}</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Travel Cost:</span>
                          <span className={`font-semibold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                            ${travelCost.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Travel Time:</span>
                          <span className="text-white font-semibold">
                            {GAME_CONFIG.TRAVEL_TIME / 60} min
                          </span>
                        </div>
                      </div>

                      {!canAfford && (
                        <div className="mt-3 bg-red-900/20 border border-red-500 rounded p-2">
                          <p className="text-red-400 text-xs">Not enough money</p>
                        </div>
                      )}

                      {selectedCity === city.id && (
                        <div className="mt-3 bg-red-600/20 border border-red-500 rounded p-2">
                          <p className="text-red-400 text-xs">Selected for travel</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Travel Confirmation */}
          {selectedCity !== null && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">Confirm Travel</h3>
                
                <div className="flex items-center justify-center space-x-8 mb-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{currentCity.flag}</div>
                    <p className="text-gray-400">{currentCity.name}</p>
                  </div>
                  
                  <div className="text-2xl text-red-500">→</div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">{CITIES[selectedCity].flag}</div>
                    <p className="text-white font-semibold">{CITIES[selectedCity].name}</p>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-lg">
                        ${getTravelCost().toLocaleString()}
                      </div>
                      <div className="text-gray-400">Cost</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">
                        {GAME_CONFIG.TRAVEL_TIME / 60} min
                      </div>
                      <div className="text-gray-400">Travel Time</div>
                    </div>
                  </div>
                  
                  {/* Car damage warning */}
                  <div className="mt-4 bg-amber-500/20 border border-amber-500 rounded p-3">
                    <p className="text-amber-500 text-sm">
                      ⚠️ Your car will take {GAME_CONFIG.CAR_DAMAGE_PER_TRAVEL}% damage from this journey
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedCity(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleTravel}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Traveling...' : 'Confirm Travel'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Travel Tips */}
          <div className="mt-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold text-red-500 mb-4">✈️ Travel Tips</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-white">
                    💡 <strong>Different cities</strong> offer unique opportunities and challenges
                  </p>
                  <p className="text-white">
                    🕐 <strong>Travel takes time</strong> - plan your moves carefully
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white">
                    💰 <strong>Save money</strong> for travel costs and emergencies
                  </p>
                  <p className="text-white">
                    🚗 <strong>Cars take damage</strong> - Each trip damages your car by {GAME_CONFIG.CAR_DAMAGE_PER_TRAVEL}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}