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

    // Check if MiniKit is available
    if (!MiniKit.isInstalled()) {
      console.error('MiniKit is not installed');
      setVerificationState('failed');
      setTimeout(() => setVerificationState('idle'), 3000);
      return;
    }

    setVerificationState('pending');

    try {
      // 1. Call MiniKit verification
      const result = await MiniKit.commandsAsync.verify({
        action: 'testAction',
        verification_level: VerificationLevel.Device,
      });
      
      console.log('MiniKit verification result:', result);
      
      // 2. Check if user cancelled or error occurred
      if (!result || !result.finalPayload) {
        console.log('User cancelled verification or no payload received');
        setVerificationState('failed');
        setTimeout(() => setVerificationState('idle'), 3000);
        return;
      }

      // 3. Check for error status in finalPayload
      if (result.finalPayload.status === 'error') {
        console.error('Verification failed:', result.finalPayload);
        setVerificationState('failed');
        setTimeout(() => setVerificationState('idle'), 3000);
        return;
      }
      
      // 4. Verify proof on server
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: result.finalPayload,
          action: 'testAction',
        }),
      });

      if (!response.ok) {
        console.error('Server response not ok:', response.status, response.statusText);
        setVerificationState('failed');
        setTimeout(() => setVerificationState('idle'), 3000);
        return;
      }

      const data = await response.json();
      console.log('Server verification response:', data);
      
      if (data.verifyRes && data.verifyRes.success) {
        // 5. Store verification status
        localStorage.setItem('worldid_verified', 'true');
        localStorage.setItem('worldid_nullifier', data.verifyRes.nullifier_hash);
        
        // 6. Show success state briefly
        setVerificationState('success');
        
        // 7. Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        // Verification failed
        console.error('Server verification failed:', data.verifyRes || data);
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