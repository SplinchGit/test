'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

/**
 * This component is an example of how to use World ID in Mini Apps
 * Minikit commands must be used on client components
 * It's critical you verify the proof on the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */
export const Verify = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const { setPlayer } = useGameStore();

  const onClickVerify = async () => {
    setButtonState('pending');
    const result = await MiniKit.commandsAsync.verify({
      action: 'verify',
      verification_level: VerificationLevel.Device,
    });
    console.log(result.finalPayload);
    // Verify the proof
    const response = await fetch('/api/verify-proof', {
      method: 'POST',
      body: JSON.stringify({
        payload: result.finalPayload,
        action: 'verify',
      }),
    });

    const data = await response.json();
    if (data.verifyRes.success) {
      setButtonState('success');
      
      // Store verification data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('worldid_verified', 'true');
        localStorage.setItem('worldid_nullifier', data.verifyRes.nullifier_hash);
      }
      
      // Check if user has existing game account
      const accountResponse = await fetch('/api/game/check-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nullifierHash: data.verifyRes.nullifier_hash
        })
      });
      
      const accountData = await accountResponse.json();
      
      if (accountData.hasAccount && accountData.player) {
        // User has existing account, load player data and go to dashboard
        setPlayer(accountData.player);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', accountData.token);
        }
        window.location.href = '/dashboard';
      } else {
        // User needs to create account, redirect to game-setup
        window.location.href = '/game-setup';
      }
    } else {
      setButtonState('failed');
      console.error('Verification failed:', data.verifyRes);

      // Reset the button state after 3 seconds
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Verify with World ID</p>
      <LiveFeedback
        label={{
          failed: 'Failed to verify',
          pending: 'Verifying',
          success: 'Verified',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickVerify}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Verify with World ID
        </Button>
      </LiveFeedback>
    </div>
  );
};
