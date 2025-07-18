'use client';

import { ReactNode, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Install MiniKit - this is what makes MiniKit.isInstalled() return true
    MiniKit.install();
    
    // Wait a bit to ensure installation is complete
    setTimeout(() => {
      if (MiniKit.isInstalled()) {
        console.log('MiniKit installed successfully');
      } else {
        console.warn('MiniKit installation failed');
      }
    }, 100);
  }, []);

  return <>{children}</>;
}