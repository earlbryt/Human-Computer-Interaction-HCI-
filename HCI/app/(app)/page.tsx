import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { getAppConfig } from '@/lib/utils';

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function Page({ searchParams }: PageProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const startParam = typeof searchParams?.start === 'string' ? searchParams?.start : undefined;
  const autoStartCall = startParam === 'call';

  return <App appConfig={appConfig} autoStartCall={autoStartCall} />;
}
