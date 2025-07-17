'use client';

// import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CARS } from '../../types/constants';
import GameNavigation from '../../components/GameNavigation';
import Link from 'next/link';

export default function Garage() {
  const { player, isLoading } = useGameStore();

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

  const activateCarHandler = (carId: string) => {
    // This would call an API to set the active car
    console.log('Activating car:', carId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameNavigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">🚗 Garage</h1>
            <p className="text-gray-400 text-lg">
              Manage your collection of stolen and purchased vehicles
            </p>
          </div>

          {/* Current Active Car */}
          {player.activeCar && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">🏁 Active Vehicle</h2>
              {(() => {
                const activeCar = player.cars.find(c => c.id === player.activeCar);
                const carData = activeCar ? CARS[activeCar.carType] : null;
                
                if (!carData || !activeCar) return <p className="text-gray-400">No active car</p>;
                
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{carData.name}</h3>
                      <p className="text-gray-400">Damage: {activeCar.damage}%</p>
                      <p className="text-gray-400">Source: {activeCar.source}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Stats</div>
                      <div className="text-white">Speed: {carData.speed}</div>
                      <div className="text-white">Accel: {carData.accel}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Car Collection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Collection</h2>
            
            {player.cars.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
                <div className="text-4xl mb-4">🚗</div>
                <h3 className="text-xl font-bold text-white mb-2">No Cars Yet</h3>
                <p className="text-gray-400 mb-4">
                  You don&apos;t have any cars in your garage. Get some by committing Grand Theft Auto crimes or buying them from the store.
                </p>
                <div className="flex space-x-4 justify-center">
                  <Link 
                    href="/crimes" 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Steal Cars
                  </Link>
                  <Link 
                    href="/store" 
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Buy Cars
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {player.cars.map((car) => {
                  const carData = CARS[car.carType];
                  const isActive = player.activeCar === car.id;
                  
                  return (
                    <div 
                      key={car.id} 
                      className={`bg-gray-800 p-6 rounded-lg border transition-all ${
                        isActive ? 'border-red-500 bg-red-900/20' : 'border-gray-700'
                      }`}
                    >
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">🚗</div>
                        <h3 className="text-xl font-bold text-white">{carData.name}</h3>
                        {isActive && (
                          <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded-full mt-1">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Damage:</span>
                          <span className={`font-semibold ${
                            car.damage > 50 ? 'text-red-400' : car.damage > 25 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {car.damage}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Speed:</span>
                          <span className="text-white font-semibold">{carData.speed}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Acceleration:</span>
                          <span className="text-white font-semibold">{carData.accel}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Source:</span>
                          <span className="text-white font-semibold capitalize">
                            {car.source.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {!isActive && (
                          <button
                            onClick={() => activateCarHandler(car.id)}
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        
                        {car.damage > 0 && (
                          <button
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                          >
                            Repair (${Math.round(car.damage * 100)})
                          </button>
                        )}
                        
                        <button
                          disabled={isLoading}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                        >
                          Melt for Bullets
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Garage Tips */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold text-red-500 mb-4">🔧 Garage Tips</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-white">
                  🚗 <strong>Active cars</strong> provide bonuses during combat and travel
                </p>
                <p className="text-white">
                  🔧 <strong>Repair damaged cars</strong> to maintain their effectiveness
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-white">
                  💥 <strong>Melt cars</strong> to convert them into bullets for combat
                </p>
                <p className="text-white">
                  🎯 <strong>Different cars</strong> have different stats and abilities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}