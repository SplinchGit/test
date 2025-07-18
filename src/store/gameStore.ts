import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { Player, GameState, CrimeResult } from '../types/game';
import { RANKS } from '../types/constants';

interface GameStore extends GameState {
  // Actions
  setPlayer: (player: Player | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  clearError: () => void;
  logout: () => void;
  
  // Game actions
  commitCrime: (crimeId: number) => Promise<CrimeResult | null>;
  travel: (cityId: number) => Promise<boolean>;
  buyCar: (carId: number) => Promise<boolean>;
  buyGun: (gunId: number) => Promise<boolean>;
  buyProtection: (protectionId: number) => Promise<boolean>;
  swissBank: (action: 'deposit' | 'withdraw', amount: number) => Promise<boolean>;
  searchPlayer: (targetUsername: string) => Promise<boolean>;
  shootPlayer: () => Promise<boolean>;
  cancelSearch: () => Promise<boolean>;
  
  // Computed values
  getCurrentRank: () => string;
  canCommitCrime: (crimeId: number) => boolean;
  getTimeUntilFree: () => number;
  isInJail: () => boolean;
  isInHospital: () => boolean;
}

const storeCreator = (set: any, get: any): GameStore => ({
  // Initial state
  player: null,
  isLoading: false,
  error: null,
  lastUpdate: new Date().toISOString(),

  // Actions
  setPlayer: (player: Player | null) => 
    set({ player, lastUpdate: new Date().toISOString() }, false, 'setPlayer'),

  setLoading: (isLoading: boolean) => 
    set({ isLoading }, false, 'setLoading'),

  setError: (error: string | null) => 
    set({ error }, false, 'setError'),

  updatePlayer: (updates: Partial<Player>) => 
    set((state: GameStore) => ({
      player: state.player ? { ...state.player, ...updates } : null,
      lastUpdate: new Date().toISOString()
    }), false, 'updatePlayer'),

  clearError: () => 
    set({ error: null }, false, 'clearError'),

  logout: () => 
    set({ 
      player: null, 
      error: null, 
      lastUpdate: new Date().toISOString() 
    }, false, 'logout'),

  // Game actions
  commitCrime: async (crimeId: number): Promise<CrimeResult | null> => {
    const { player } = get();
    if (!player) return null;

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/crimes/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
        },
        body: JSON.stringify({ crimeId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to commit crime');
      }

      // Update player with new stats
      set(() => ({
        player: data.player,
        isLoading: false,
        lastUpdate: new Date().toISOString()
      }));

      return data.result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  travel: async (cityId: number): Promise<boolean> => {
    const { player } = get();
    if (!player) return false;

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/player/travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
        },
        body: JSON.stringify({ cityId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to travel');
      }

      set(() => ({
        player: data.player,
        isLoading: false,
        lastUpdate: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // ... rest of your methods with the same localStorage fix ...

  // Computed values
  getCurrentRank: () => {
    const { player } = get();
    return player ? RANKS[player.rank].name : 'Unknown';
  },

  canCommitCrime: (crimeId: number) => {
    const { player } = get();
    if (!player) return false;
    return !get().isInJail() && !get().isInHospital();
  },

  getTimeUntilFree: () => {
    const { player } = get();
    if (!player) return 0;
    
    const now = Date.now();
    if (player.jailUntil && new Date(player.jailUntil).getTime() > now) {
      return new Date(player.jailUntil).getTime() - now;
    }
    if (player.hospitalUntil && new Date(player.hospitalUntil).getTime() > now) {
      return new Date(player.hospitalUntil).getTime() - now;
    }
    return 0;
  },

  isInJail: () => {
    const { player } = get();
    if (!player || !player.jailUntil) return false;
    return new Date(player.jailUntil).getTime() > Date.now();
  },

  isInHospital: () => {
    const { player } = get();
    if (!player || !player.hospitalUntil) return false;
    return new Date(player.hospitalUntil).getTime() > Date.now();
  },

  // Add missing methods with default implementations
  buyCar: async (carId: number) => {
    set({ error: "Not implemented" });
    return false;
  },
  buyGun: async (gunId: number) => {
    set({ error: "Not implemented" });
    return false;
  },
  buyProtection: async (protectionId: number) => {
    set({ error: "Not implemented" });
    return false;
  },
  swissBank: async (action: 'deposit' | 'withdraw', amount: number) => {
    set({ error: "Not implemented" });
    return false;
  },
  searchPlayer: async (targetUsername: string) => {
    set({ error: "Not implemented" });
    return false;
  },
  shootPlayer: async () => {
    set({ error: "Not implemented" });
    return false;
  },
  cancelSearch: async () => {
    set({ error: "Not implemented" });
    return false;
  }
});

// Create store with SSR-safe persist
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      storeCreator,
      {
        name: 'game-storage',
        storage: createJSONStorage(() => {
          // Only use localStorage on client side
          if (typeof window !== 'undefined') {
            return localStorage;
          }
          // Return a no-op storage for SSR
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          };
        }),
        skipHydration: true, // Important: skip hydration on server
      }
    ),
    {
      name: 'game-store',
    }
  )
);

// Manual hydration on client side
if (typeof window !== 'undefined') {
  useGameStore.persist.rehydrate();
}