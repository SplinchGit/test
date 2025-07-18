'use client';

import eruda from 'eruda';
import { ReactNode, useEffect } from 'react';
import { Session } from 'next-auth';

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
          eruda.init();
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
  session: Session | null;
}

export default function ClientProviders({ children, session }: ClientProvidersProps) {
  return (
    <ErudaProvider>
      {children}
    </ErudaProvider>
  );
}