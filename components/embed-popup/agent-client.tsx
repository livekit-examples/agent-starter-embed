'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { XIcon } from '@phosphor-icons/react';
import { PopupView } from '@/components/embed-popup/popup-view';
import { Trigger } from '@/components/embed-popup/trigger';
import { Button } from '@/components/ui/button';
import useConnectionDetails from '@/hooks/use-connection-details';
import { type AppConfig, EmbedErrorDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

export type EmbedFixedAgentClientProps = {
  appConfig: AppConfig;
};

function EmbedFixedAgentClient({ appConfig }: EmbedFixedAgentClientProps) {
  const room = useMemo(() => new Room(), []);
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentError, setCurrentError] = useState<EmbedErrorDetails | null>(null);
  const { connectionDetails, refreshConnectionDetails } = useConnectionDetails();

  const handleTogglePopup = () => {
    setPopupOpen((open) => !open);

    if (currentError) {
      handleDismissError();
    }
  };

  const handleDismissError = () => {
    room.disconnect();
    setCurrentError(null);
  };

  useEffect(() => {
    const onDisconnected = () => {
      setPopupOpen(false);
      refreshConnectionDetails();
    };
    const onMediaDevicesError = (error: Error) => {
      setCurrentError({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    };
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, refreshConnectionDetails]);

  useEffect(() => {
    if (!popupOpen) {
      return;
    }
    if (room.state !== 'disconnected') {
      return;
    }
    if (!connectionDetails) {
      return;
    }

    const connect = async () => {
      try {
        await room.connect(connectionDetails.serverUrl, connectionDetails.participantToken);
        await room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: appConfig.isPreConnectBufferEnabled,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error connecting to agent:', error);
          setCurrentError({
            title: 'There was an error connecting to the agent',
            description: `${error.name}: ${error.message}`,
          });
        }
      }
    };
    connect();

    return () => {
      room.disconnect();
    };
  }, [room, popupOpen, connectionDetails, appConfig.isPreConnectBufferEnabled]);

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      <StartAudio label="Start Audio" />

      <Trigger error={!!currentError} popupOpen={popupOpen} onToggle={handleTogglePopup} />

      <motion.div
        inert={!popupOpen}
        initial={{
          opacity: 0,
          translateY: 8,
        }}
        animate={{
          opacity: popupOpen ? 1 : 0,
          translateY: popupOpen ? 0 : 8,
        }}
        transition={{
          type: 'spring',
          duration: 1,
          bounce: 0,
        }}
        className="fixed right-0 bottom-20 z-50 w-full px-4"
      >
        <div className="bg-bg2 dark:bg-bg1 border-separator1 ml-auto h-[480px] w-full rounded-[28px] border drop-shadow-md md:max-w-[360px]">
          <div className="relative h-full w-full">
            <div
              inert={currentError === null}
              className={cn(
                'absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-5 transition-opacity',
                currentError === null ? 'opacity-0' : 'opacity-100'
              )}
            >
              <div className="pl-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/lk-logo.svg" alt="LiveKit Logo" className="block size-6 dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/lk-logo-dark.svg"
                  alt="LiveKit Logo"
                  className="hidden size-6 dark:block"
                />
              </div>

              <div className="flex w-full flex-col justify-center gap-1 overflow-auto px-4 text-center">
                <span className="text-sm font-medium">{currentError?.title}</span>
                <span className="text-xs">{currentError?.description}</span>
              </div>

              <Button variant="secondary" onClick={handleDismissError}>
                <XIcon /> Dismiss
              </Button>
            </div>
            <div
              inert={currentError !== null}
              className={cn(
                'absolute inset-0 transition-opacity',
                currentError === null ? 'opacity-100' : 'opacity-0'
              )}
            >
              <PopupView
                disabled={!popupOpen}
                sessionStarted={popupOpen}
                onDisplayError={setCurrentError}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </RoomContext.Provider>
  );
}

export default EmbedFixedAgentClient;
