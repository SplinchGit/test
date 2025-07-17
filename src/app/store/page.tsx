'use client';

import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GUNS, PROTECTION, CARS } from '../../types/constants';
import GameNavigation from '../../components/GameNavigation';
import Link from 'next/link';

export default function Store() {
  const { player, buyGun, buyProtection, buyCar, isLoading } = useGameStore();
  const [activeTab, setActiveTab] = useState<'guns' | 'protection' | 'cars'>('guns');

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

  const canAfford = (price: number) => player.money >= price;
  const currentGun = player.gunId !== undefined ? GUNS[player.gunId] : null;
  const currentProtection = player.protectionId !== undefined ? PROTECTION[player.protectionId] : null;

  const handlePurchase = async (type: 'gun' | 'protection' | 'car', id: number) => {
    switch (type) {
      case 'gun':
        await buyGun(id);
        break;
      case 'protection':
        await buyProtection(id);
        break;
      case 'car':
        await buyCar(id);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameNavigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">🏪 Store</h1>
            <p className="text-gray-400 text-lg">
              Equip yourself for the criminal underworld
            </p>
          </div>

          {/* Player Money */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8">
            <div className="text-center">
              <span className="text-gray-400">Cash Available: </span>
              <span className="text-green-400 text-xl font-mono font-bold">
                ${player.money.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('guns')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'guns'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔫 Guns
            </button>
            <button
              onClick={() => setActiveTab('protection')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'protection'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🛡️ Protection
            </button>
            <button
              onClick={() => setActiveTab('cars')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'cars'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🚗 Cars
            </button>
          </div>

          {/* Current Equipment */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Current Equipment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🔫</div>
                <div className="text-white font-semibold">
                  {currentGun ? currentGun.name : 'No Gun'}
                </div>
                {currentGun && (
                  <div className="text-sm text-gray-400">
                    Bullet Efficiency: {currentGun.divisor}x
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-white font-semibold">
                  {currentProtection ? currentProtection.name : 'No Protection'}
                </div>
                {currentProtection && (
                  <div className="text-sm text-gray-400">
                    Defense Multiplier: {currentProtection.multiplier}x
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-2xl mb-2">🔫</div>
                <div className="text-white font-semibold">
                  {player.bullets} Bullets
                </div>
                <div className="text-sm text-gray-400">
                  Available ammunition
                </div>
              </div>
            </div>
          </div>

          {/* Store Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'guns' && GUNS.map((gun) => {
              const owned = player.gunId === gun.id;
              const affordable = canAfford(gun.price);
              
              return (
                <div key={gun.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{gun.name}</h3>
                    <div className="text-2xl mb-2">🔫</div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-green-400 font-semibold">
                        ${gun.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bullet Efficiency:</span>
                      <span className="text-white font-semibold">{gun.divisor}x</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase('gun', gun.id)}
                    disabled={owned || !affordable || isLoading}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      owned
                        ? 'bg-green-600 text-white cursor-default'
                        : affordable && !isLoading
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {owned ? 'Owned' : !affordable ? 'Cannot Afford' : isLoading ? 'Buying...' : 'Buy'}
                  </button>
                </div>
              );
            })}

            {activeTab === 'protection' && PROTECTION.map((protection) => {
              const owned = player.protectionId === protection.id;
              const affordable = canAfford(protection.price);
              
              return (
                <div key={protection.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{protection.name}</h3>
                    <div className="text-2xl mb-2">🛡️</div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-green-400 font-semibold">
                        ${protection.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Defense Multiplier:</span>
                      <span className="text-white font-semibold">{protection.multiplier}x</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase('protection', protection.id)}
                    disabled={owned || !affordable || isLoading}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      owned
                        ? 'bg-green-600 text-white cursor-default'
                        : affordable && !isLoading
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {owned ? 'Owned' : !affordable ? 'Cannot Afford' : isLoading ? 'Buying...' : 'Buy'}
                  </button>
                </div>
              );
            })}

            {activeTab === 'cars' && CARS.map((car) => {
              const owned = player.cars.some(c => c.carType === car.id);
              const affordable = canAfford(car.price);
              
              return (
                <div key={car.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{car.name}</h3>
                    <div className="text-2xl mb-2">🚗</div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-green-400 font-semibold">
                        ${car.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Speed:</span>
                      <span className="text-white font-semibold">{car.speed}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Acceleration:</span>
                      <span className="text-white font-semibold">{car.accel}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Bullets:</span>
                      <span className="text-white font-semibold">{car.baseBullets}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase('car', car.id)}
                    disabled={owned || !affordable || isLoading}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                      owned
                        ? 'bg-green-600 text-white cursor-default'
                        : affordable && !isLoading
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {owned ? 'Owned' : !affordable ? 'Cannot Afford' : isLoading ? 'Buying...' : 'Buy'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}