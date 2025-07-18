'use client';

import { ReactNode, useEffect } from 'react';

const ErudaProvider = (props: { children: ReactNode }) => {
  useEffect(() => {
    // Just show Eruda. Period.
    import('eruda').then((eruda) => {
      eruda.default.init();
      console.log('Eruda initialized - check for the floating button!');
    }).catch(error => {
      console.error('Eruda failed to load:', error);
    });
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