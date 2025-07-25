import { AnimatePresence, motion } from 'motion/react';
import { useVoiceAssistant } from '@livekit/components-react';
import { PhoneDisconnectIcon, XIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const AnimatedButton = motion.create(Button);

interface TriggerProps {
  error: boolean;
  popupOpen: boolean;
  onToggle: () => void;
}

export function Trigger({ error = false, popupOpen, onToggle }: TriggerProps) {
  const { state: agentState } = useVoiceAssistant();

  const isAgentConnecting = agentState === 'connecting' || agentState === 'initializing';
  const isAgentConnected =
    popupOpen &&
    agentState !== 'disconnected' &&
    agentState !== 'connecting' &&
    agentState !== 'initializing';

  return (
    <AnimatePresence>
      <AnimatedButton
        key="trigger-button"
        size="lg"
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        exit={{ scale: 0 }}
        transition={{
          type: 'spring',
          duration: 1,
          bounce: 0.2,
        }}
        onClick={onToggle}
        className={cn(
          'relative m-0 block size-12 p-0.5 drop-shadow-md',
          'scale-100 transition-[scale] duration-300 hover:scale-105 focus:scale-105',
          'fixed right-4 bottom-4 z-50'
        )}
      >
        <motion.div
          className={cn(
            'absolute inset-0 z-10 rounded-full',
            !error &&
              isAgentConnecting &&
              'bg-fgAccent/30 animate-spin [background-image:conic-gradient(from_0deg,transparent_0%,transparent_30%,var(--color-fgAccent)_50%,transparent_70%,transparent_100%)]',
            agentState === 'disconnected' && 'bg-fgAccent',
            (error || isAgentConnected) && 'bg-destructive-foreground'
          )}
        />
        <div
          className={cn(
            'relative z-20 grid size-11 place-items-center rounded-full',
            error || isAgentConnected ? 'bg-destructive' : 'bg-bg1'
          )}
        >
          {!error && isAgentConnected && (
            <PhoneDisconnectIcon
              weight="bold"
              size={20}
              className="text-destructive-foreground size-5"
            />
          )}
          {!error && isAgentConnecting && (
            <XIcon size={20} weight="bold" className="text-fg0 size-5" />
          )}
          {!error && agentState === 'disconnected' && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/lk-logo.svg" alt="LiveKit Logo" className="block size-4 dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/lk-logo-dark.svg"
                alt="LiveKit Logo"
                className="hidden size-4 dark:block"
              />
            </>
          )}
          {error && (
            <XIcon size={20} weight="bold" className="text-destructive-foreground size-5" />
          )}
        </div>
      </AnimatedButton>
    </AnimatePresence>
  );
}
