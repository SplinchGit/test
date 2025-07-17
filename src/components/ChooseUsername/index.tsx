'use client';
import { useState, useEffect } from 'react';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { validateUsername } from '@/utils/validation';

interface ChooseUsernameProps {
  walletAddress: string;
  onUsernameSelected: (player: any, token: string) => void;
  onBack: () => void;
}

export const ChooseUsername = ({ walletAddress, onUsernameSelected, onBack }: ChooseUsernameProps) => {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const checkAvailability = async (usernameToCheck: string) => {
    const validation = validateUsername(usernameToCheck);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid username');
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch(`/api/game/check-username?username=${encodeURIComponent(usernameToCheck)}`);
      const data = await response.json();
      
      if (response.ok) {
        setIsAvailable(data.available);
        if (!data.available) {
          setError(data.error || 'Username is already taken');
        }
      } else {
        setError(data.error || 'Failed to check username availability');
        setIsAvailable(null);
      }
    } catch (error) {
      setError('Failed to check username availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setIsAvailable(null);
    setError(null);

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new debounced check
    if (newUsername.length >= 3) {
      const timer = setTimeout(() => {
        checkAvailability(newUsername);
      }, 500);
      setDebounceTimer(timer);
    }
  };

  const handleCreateAccount = async () => {
    if (!username || !isAvailable) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/game/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onUsernameSelected(data.player, data.token);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-500 mb-2">
            🎭 Welcome to MAFIOSO
          </h1>
          <p className="text-gray-400 text-sm">
            Connected: <span className="text-yellow-400">{truncatedAddress}</span>
          </p>
        </div>

        <div className="mb-6">
          <p className="text-white mb-4 text-center">
            Choose your criminal alias to begin your journey in the underworld.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">👤 Choose Username</h3>
            <p className="text-sm text-gray-400 mb-4">
              3-12 characters, letters, numbers, and underscores only
            </p>
            
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                maxLength={12}
                disabled={isCreating}
              />
              
              {isChecking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                </div>
              )}
              
              {isAvailable === true && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-green-500 text-lg">✓</span>
                </div>
              )}
              
              {isAvailable === false && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-red-500 text-lg">✗</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <LiveFeedback
            label={{
              failed: 'Failed to create account',
              pending: 'Creating account...',
              success: 'Account created!',
            }}
            state={isCreating ? 'pending' : undefined}
          >
            <Button
              onClick={handleCreateAccount}
              disabled={!username || !isAvailable || isCreating || isChecking}
              size="lg"
              variant="primary"
              className="w-full"
            >
              {isCreating ? 'Creating Account...' : 'Create Account & Enter'}
            </Button>
          </LiveFeedback>

          <button
            onClick={onBack}
            disabled={isCreating}
            className="w-full text-gray-400 hover:text-white py-2 transition-colors"
          >
            ← Back to Authentication
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            <p className="mb-1">🔐 Your account will be permanently linked to this wallet</p>
            <p>Use the same wallet to automatically recover your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};