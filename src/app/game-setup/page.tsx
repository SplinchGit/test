'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChooseUsername } from '@/components/ChooseUsername';
import { Page } from '@/components/PageLayout';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types/game';

export default function GameSetup() {
  const router = useRouter();
  const { setPlayer } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nullifierHash, setNullifierHash] = useState<string>('');

  useEffect(() => {
    const initializeGame = async () => {
      // Check if user has verified with WorldID
      const isVerified = localStorage.getItem('worldid_verified');
      const storedNullifier = localStorage.getItem('worldid_nullifier');
      
      if (!isVerified || !storedNullifier) {
        router.push('/');
        return;
      }

      setNullifierHash(storedNullifier);

      try {
        // Check if user already has an account using the nullifier hash
        const response = await fetch('/api/game/check-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nullifierHash: storedNullifier,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check account status');
        }

        if (data.hasAccount) {
          // User has existing account, store auth token and go to game
          localStorage.setItem('auth_token', data.token);
          setPlayer(data.player);
          router.push('/dashboard');
        } else {
          // User needs to choose username
          setNeedsUsername(true);
        }
      } catch (error) {
        console.error('Game initialization error:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize game');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [router, setPlayer]);

  const handleUsernameSelected = (player: Player, token: string) => {
    // Store auth token and player data
    localStorage.setItem('auth_token', token);
    setPlayer(player);
    
    // Redirect to game
    router.push('/dashboard');
  };

  const handleBack = () => {
    // Clear WorldID verification status
    localStorage.removeItem('worldid_verified');
    localStorage.removeItem('worldid_nullifier');
    router.push('/');
  };

  if (isLoading) {
    return (
      <Page>
        <Page.Main className="flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-white">Setting up your game...</p>
          </div>
        </Page.Main>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Page.Main className="flex flex-col items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Setup Error</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
            >
              Back to Login
            </button>
          </div>
        </Page.Main>
      </Page>
    );
  }

  if (needsUsername) {
    return (
      <ChooseUsername
        walletAddress={nullifierHash} // Using nullifier hash as unique identifier
        onUsernameSelected={handleUsernameSelected}
        onBack={handleBack}
      />
    );
  }

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Redirecting...</p>
        </div>
      </Page.Main>
    </Page>
  );
}