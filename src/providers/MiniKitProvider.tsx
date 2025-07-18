'use client';

import { ReactNode, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Install MiniKit - this is what makes MiniKit.isInstalled() return true
    MiniKit.install();
    
    console.log('MiniKit installed:', MiniKit.isInstalled());
  }, []);

  return <>{children}</>;
}