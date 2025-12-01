'use client';

import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { TokenSource } from 'livekit-client';
import { SessionProvider, useMaybeRoomContext, useSession } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';

interface ConnectionContextType {
  isConnectionActive: boolean;
  connect: (startSession?: boolean) => void;
  startDisconnectTransition: () => void;
  onDisconnectTransitionComplete: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connect: () => {},
  startDisconnectTransition: () => {},
  onDisconnectTransitionComplete: () => {},
});

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return ctx;
}

interface ConnectionProviderProps {
  appConfig: AppConfig;
  children: React.ReactNode;
}

export function ConnectionProvider({ appConfig, children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);
  const [hasDisconnected, setHasDisconnected] = useState(false);
  const [disconnectScheduled, setDisconnectScheduled] = useState(false);

  const tokenSource = useMemo(() => {
    if (typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string') {
      return TokenSource.custom(async () => {
        const url = new URL(process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT!, window.location.origin);

        try {
          let participantMetadata: string | undefined = undefined;
          try {
            const stored = window.sessionStorage.getItem('plant-diagnosis');
            if (stored) {
              const parsed = JSON.parse(stored) as any;
              const cls = String(parsed?.className ?? '');
              const isHealthy = cls.toUpperCase() === 'NULL';
              const confidence = Number(parsed?.confidence ?? 0);
              participantMetadata = JSON.stringify({
                className: cls,
                confidence,
                isHealthy,
                action: parsed?.action,
                tips: parsed?.tips,
                imageUrl: parsed?.imageUrl,
              });
            }
          } catch {}

          const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              room_config: appConfig.agentName
                ? {
                    agents: [{ agent_name: appConfig.agentName }],
                  }
                : undefined,
              participant_metadata: participantMetadata,
            }),
          });
          try {
            if (participantMetadata) {
              window.sessionStorage.removeItem('plant-diagnosis');
            }
          } catch {}
          return await res.json();
        } catch (error) {
          console.error('Error fetching connection details:', error);
          throw new Error('Error fetching connection details!');
        }
      });
    }

    return TokenSource.endpoint('/api/connection-details');
  }, [appConfig]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;
  const room = useMaybeRoomContext();

  const hasDisconnectedRef = useRef(false);
  const disconnectScheduledRef = useRef(false);

  const value = useMemo(() => {
    const endCallOnce = async () => {
      if (hasDisconnectedRef.current) return;
      hasDisconnectedRef.current = true;
      setHasDisconnected(true);
      endSession();
      setDisconnectScheduled(false);
      disconnectScheduledRef.current = false;
    };

    return {
      isConnectionActive,
      connect: () => {
        setIsConnectionActive(true);
        setHasDisconnected(false);
        setDisconnectScheduled(false);
        hasDisconnectedRef.current = false;
        disconnectScheduledRef.current = false;
        startSession();
      },
      startDisconnectTransition: () => {
        setIsConnectionActive(false);
        if (hasDisconnectedRef.current || disconnectScheduledRef.current) return;
        setDisconnectScheduled(true);
        disconnectScheduledRef.current = true;
        setTimeout(() => {
          void endCallOnce();
        }, 0);
      },
      onDisconnectTransitionComplete: () => {
        if (!hasDisconnectedRef.current) {
          void endCallOnce();
        } else {
          setDisconnectScheduled(false);
          disconnectScheduledRef.current = false;
        }
      },
    };
  }, [startSession, endSession, isConnectionActive]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
    </SessionProvider>
  );
}
