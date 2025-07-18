'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const AuthButton = () => {
  const router = useRouter();
  const [verificationState, setVerificationState] = useState<
    'idle' | 'pending' | 'success' | 'failed'
  >('idle');

  // Check if already verified on component mount
  useEffect(() => {
    const isVerified = localStorage.getItem('worldid_verified');
    const nullifierHash = localStorage.getItem('worldid_nullifier');
    
    if (isVerified === 'true' && nullifierHash) {
      // Already verified, redirect to dashboard
      router.push('/dashboard');
    }
  }, [router]);

  const onClick = useCallback(async () => {
    if (verificationState === 'pending') return;

    setVerificationState('pending');

    try {
      // 1. Call MiniKit verification
      const result = await MiniKit.commandsAsync.verify({
        action: 'test-action',
        verification_level: VerificationLevel.Device,
      });
      
      console.log('MiniKit verification result:', result);
      
      // 2. Check if user cancelled or error occurred
      if (!result || !result.finalPayload) {
        setVerificationState('failed');
        setTimeout(() => setVerificationState('idle'), 3000);
        return;
      }
      
      // 3. Verify proof on server
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: result.finalPayload,
          action: 'test-action',
        }),
      });

      const data = await response.json();
      console.log('Server verification response:', data);
      
      if (data.verifyRes.success) {
        // 4. Store verification status
        localStorage.setItem('worldid_verified', 'true');
        localStorage.setItem('worldid_nullifier', data.verifyRes.nullifier_hash);
        
        // 5. Show success state briefly
        setVerificationState('success');
        
        // 6. Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Verification failed
        console.error('Server verification failed:', data.verifyRes);
        setVerificationState('failed');
        setTimeout(() => setVerificationState('idle'), 3000);
      }
    } catch (error) {
      console.error('World ID verification error:', error);
      setVerificationState('failed');
      setTimeout(() => setVerificationState('idle'), 3000);
    }
  }, [router, verificationState]);

  return (
    <LiveFeedback
      label={{
        failed: 'Failed to verify',
        pending: 'Verifying with World ID',
        success: 'Verified! Redirecting...',
      }}
      state={verificationState === 'idle' ? undefined : verificationState}
    >
      <Button
        onClick={onClick}
        disabled={verificationState === 'pending'}
        size="lg"
        variant="primary"
      >
        Sign in with World ID
      </Button>
    </LiveFeedback>
  );
};