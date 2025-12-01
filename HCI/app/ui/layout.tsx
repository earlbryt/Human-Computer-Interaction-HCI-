import { ConnectionProvider } from '@/hooks/useConnection';
import { getAppConfig } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const appConfig = await getAppConfig();

  return (
    <ConnectionProvider appConfig={appConfig}>
      <div className="bg-muted/20 min-h-svh p-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">HCI Voice UI</h1>
            <p className="text-muted-foreground max-w-80 leading-tight text-pretty">
              A set of UI layouts for building conversational audio and video experiences.
            </p>
          </header>

          <main className="space-y-20">{children}</main>
        </div>
      </div>
    </ConnectionProvider>
  );
}
