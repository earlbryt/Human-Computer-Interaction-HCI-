import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { getAppConfig } from '@/lib/utils';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const appConfig = await getAppConfig();
  const params = (await searchParams) ?? {};
  const startParam = typeof params.start === 'string' ? params.start : undefined;
  const autoStartCall = startParam === 'call';

  return <App appConfig={appConfig} autoStartCall={autoStartCall} />;
}
