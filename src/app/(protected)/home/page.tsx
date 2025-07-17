import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Home"
          endAdornment={
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session?.user.username}
              </p>
              <Marble src={session?.user.profilePictureUrl} className="w-12" />
            </div>
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <div className="w-full max-w-md">
          <Link 
            href="/game-setup" 
            className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg transition-colors mb-6"
          >
            🎭 Enter Mafioso Game
          </Link>
        </div>
        <UserInfo />
        <Verify />
      </Page.Main>
    </>
  );
}
