import { useEffect } from 'react';
import { useAgent } from '@livekit/components-react';
import { toastAlert } from '@/components/livekit/alert-toast';
import { useConnection } from './useConnection';

export function useAgentErrors() {
  const agent = useAgent();
  const { isConnectionActive, startDisconnectTransition } = useConnection();

  useEffect(() => {
    if (isConnectionActive && agent.state === 'failed') {
      const reasons = agent.failureReasons;

      toastAlert({
        title: 'Session ended',
        description: (
          <>
            <p className="w-full">Our agent is currently overloaded, please retry shortly.</p>
          </>
        ),
      });

      startDisconnectTransition();
    }
  }, [agent, isConnectionActive, startDisconnectTransition]);
}
