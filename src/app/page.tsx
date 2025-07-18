import { Page } from '@/components/PageLayout';
import { AuthButton } from '@/components/AuthButton';

export default function Home() {
  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-500 mb-2">🎭 MAFIOSO</h1>
          <p className="text-gray-400">Verify your identity to enter the underworld</p>
        </div>
        <AuthButton />
      </Page.Main>
    </Page>
  );
}