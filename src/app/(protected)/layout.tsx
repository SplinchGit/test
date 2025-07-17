import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { redirect } from 'next/navigation';

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If the user is not authenticated, redirect to the login page
  if (!session) {
    redirect('/');
  }

  return (
    <Page>
      {children}
    </Page>
  );
}
