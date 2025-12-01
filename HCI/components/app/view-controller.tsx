'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence, type AnimationDefinition, motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { SessionView } from '@/components/app/session-view';
import { WelcomeView } from '@/components/app/welcome-view';
import { useConnection } from '@/hooks/useConnection';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
  autoStartCall?: boolean;
}

export function ViewController({ appConfig, autoStartCall = false }: ViewControllerProps) {
  const { isConnectionActive, connect, onDisconnectTransitionComplete } = useConnection();

  useEffect(() => {
    if (autoStartCall && !isConnectionActive) {
      connect();
    }
  }, [autoStartCall, connect, isConnectionActive]);

  const handleAnimationComplete = useCallback(
    (definition: AnimationDefinition) => {
      // manually end the session when the exit animation completes
      if (definition === 'hidden') {
        onDisconnectTransitionComplete();
      }
    },
    [onDisconnectTransitionComplete]
  );

  return (
    <AnimatePresence mode="wait">
      {/* Welcome view */}
      {!isConnectionActive && (
        <MotionWelcomeView key="welcome" {...VIEW_MOTION_PROPS} onStartCall={connect} />
      )}
      {/* Session view */}
      {isConnectionActive && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          appConfig={appConfig}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </AnimatePresence>
  );
}
