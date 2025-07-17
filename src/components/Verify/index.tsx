'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useState } from 'react';

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

  const onClickVerify = async () => {
    setButtonState('pending');
    const result = await MiniKit.commandsAsync.verify({
      action: 'test-action', // Make sure to create this in the developer portal -> incognito actions
      verification_level: VerificationLevel.Device,
    });
    console.log(result.finalPayload);
    // Verify the proof
    const response = await fetch('/api/verify-proof', {
      method: 'POST',
      body: JSON.stringify({
        payload: result.finalPayload,
        action: 'test-action',
      }),
    });

    const data = await response.json();
    if (data.verifyRes.success) {
      setButtonState('success');
      // Store verification status
      localStorage.setItem('worldid_verified', 'true');
      localStorage.setItem('worldid_nullifier', data.verifyRes.nullifier_hash);
      
      // Redirect to game setup after a short delay to show success
      setTimeout(() => {
        window.location.href = '/game-setup';
      }, 1500);
    } else {
      setButtonState('failed');

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
