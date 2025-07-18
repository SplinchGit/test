'use client';

import { ReactNode, useEffect } from 'react';

const ErudaProvider = (props: { children: ReactNode }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Just fucking show Eruda always when in World App or dev
        const isWorldApp = 
          window.navigator.userAgent.includes('WorldApp') ||
          window.location.href.includes('miniapp') ||
          process.env.NODE_ENV === 'development';
        
        if (isWorldApp) {
          import('eruda').then((eruda) => {
            eruda.default.init();
          });
        }
      } catch (error) {
        console.log('Eruda failed to initialize', error);
      }
    }
  }, []);

  return <>{props.children}</>;
};

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErudaProvider>
      {children}
    </ErudaProvider>
  );
}