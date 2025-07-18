'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/PageLayout';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is verified
    const isVerified = localStorage.getItem('worldid_verified');
    const nullifierHash = localStorage.getItem('worldid_nullifier');
    
    if (isVerified !== 'true' || !nullifierHash) {
      // Not verified, redirect to home
      router.push('/');
    }
  }, [router]);

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">🎭 MAFIOSO DASHBOARD</h1>
        <p className="text-gray-400">Welcome to the underworld</p>
        {/* Add your dashboard content here */}
      </Page.Main>
    </Page>
  );
}