'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useCallback, useState } from 'react';

/**
 * This component uses World ID verification for authentication
 * It will show the World ID popup for sign-in
 * Read More: https://docs.world.org/mini-apps/commands/verify
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);

  const onClick = useCallback(async () => {
    if (isPending) {
      return;
    }
    setIsPending(true);
    
    try {
      const result = await MiniKit.commandsAsync.verify({
        action: 'test-action',
        verification_level: VerificationLevel.Device,
      });
      
      console.log(result.finalPayload);
      
      // Verify the proof on the server
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        body: JSON.stringify({
          payload: result.finalPayload,
          action: 'test-action',
        }),
      });

      const data = await response.json();
      if (data.verifyRes.success) {
        // Store verification status
        localStorage.setItem('worldid_verified', 'true');
        localStorage.setItem('worldid_nullifier', data.verifyRes.nullifier_hash);
        
        // Redirect to game setup
        window.location.href = '/game-setup';
      } else {
        console.error('Verification failed');
        setIsPending(false);
      }
    } catch (error) {
      console.error('World ID verification error', error);
      setIsPending(false);
    }
  }, [isPending]);

  return (
    <LiveFeedback
      label={{
        failed: 'Failed to verify',
        pending: 'Verifying with World ID',
        success: 'Verified',
      }}
      state={isPending ? 'pending' : undefined}
    >
      <Button
        onClick={onClick}
        disabled={isPending}
        size="lg"
        variant="primary"
      >
        Sign in with World ID
      </Button>
    </LiveFeedback>
  );
};
