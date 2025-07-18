'use client';

import { ReactNode, useEffect } from 'react';
import MiniKitProvider from './MiniKitProvider';

const ErudaProvider = (props: { children: ReactNode }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('eruda').then((eruda) => {
        eruda.default.init();
        console.log('Eruda initialized!');
      }).catch(error => {
        console.error('Eruda failed to load:', error);
      });
    }
  }, []);

  return <>{props.children}</>;
};

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <MiniKitProvider>
      <ErudaProvider>
        {children}
      </ErudaProvider>
    </MiniKitProvider>
  );
}