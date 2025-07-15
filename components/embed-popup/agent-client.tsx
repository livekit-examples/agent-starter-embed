'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { CaretDownIcon, XIcon } from '@phosphor-icons/react';
import { PopupView } from '@/components/embed-popup/popup-view';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useConnectionDetails from '@/hooks/use-connection-details';
import { type AppConfig, EmbedErrorDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

export type EmbedFixedAgentClientProps = {
  appConfig: AppConfig;

  // Choose whether to render the botton fixed in the lower right (the default)
  // or just render it statically. The latter option exists largely for the welcome demo.
  buttonPosition?: 'fixed' | 'static';
};

function EmbedFixedAgentClient({
  appConfig,
  buttonPosition = 'fixed',
}: EmbedFixedAgentClientProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  const room = useMemo(() => new Room(), []);
  const { connectionDetails, refreshConnectionDetails } = useConnectionDetails();

  const [currentError, setCurrentError] = useState<EmbedErrorDetails | null>(null);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error connecting to agent:', error);
        setCurrentError({
          title: 'There was an error connecting to the agent',
          description: `${error.name}: ${error.message}`,
        });
      }
    };
    connect();

    return () => {
      room.disconnect();
    };
  }, [room, popupOpen, connectionDetails, appConfig.isPreConnectBufferEnabled]);

  const triggerButton = (
    <Button
      variant="primary"
      size="lg"
      className={cn('h-12 w-12 p-0', {
        'fixed right-4 bottom-4': buttonPosition === 'fixed',
      })}
      onClick={() => (popupOpen ? setPopupOpen(false) : setPopupOpen(true))}
    >
      <div className="bg-background flex h-10 w-10 items-center justify-center rounded-full">
        {popupOpen ? (
          <CaretDownIcon size={24} className="text-fg1" />
        ) : (
          <img src="/lk-logo-dark.svg" alt="LiveKit Logo" className="size-4" />
        )}
      </div>
    </Button>
  );

  const popupContents = (
    <div className="relative h-full w-full">
      <motion.div
        className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-5"
        animate={{
          opacity: currentError !== null ? 1 : 0,
          pointerEvents: currentError !== null ? 'auto' : 'none',
        }}
      >
        <div className="pl-3">
          <img src="/lk-logo.svg" alt="LiveKit Logo" className="block size-6 dark:hidden" />
          <img src="/lk-logo-dark.svg" alt="LiveKit Logo" className="hidden size-6 dark:block" />
        </div>

        <div className="flex flex-col justify-center gap-1">
          <span className="text-sm font-medium">{currentError?.title}</span>
          <span className="text-xs">{currentError?.description}</span>
        </div>

        <Button onClick={() => setCurrentError(null)}>
          <XIcon /> Close
        </Button>
      </motion.div>

      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <StartAudio label="Start Audio" />

        {/* --- */}

        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: currentError === null ? 1 : 0,
            pointerEvents: currentError === null ? 'auto' : 'none',
          }}
        >
          <PopupView
            key="popup-view"
            appConfig={appConfig}
            disabled={!popupOpen}
            sessionStarted={popupOpen}
            onDisplayError={setCurrentError}
          />
        </motion.div>
      </RoomContext.Provider>
    </div>
  );

  switch (buttonPosition) {
    case 'fixed':
      return (
        <>
          {/* Backdrop */}
          {popupOpen ? <div className="fixed inset-0" onClick={() => setPopupOpen(false)} /> : null}

          {triggerButton}

          <motion.div
            className="bg-bg2 fixed right-4 bottom-20 h-[480px] w-full max-w-[360px] rounded-md"
            initial={false}
            animate={{
              opacity: popupOpen ? 1 : 0,
              translateY: popupOpen ? 0 : 8,
              pointerEvents: popupOpen ? 'auto' : 'none',
            }}
          >
            {popupContents}
          </motion.div>
        </>
      );
    case 'static':
      return (
        <Popover
          open={currentError !== null ? true : popupOpen}
          onOpenChange={(newOpen) => {
            setPopupOpen(newOpen);
            if (!newOpen) {
              setCurrentError(null);
            }
          }}
        >
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent className="bg-bg2 h-[480px] w-[360px] p-0" align="end">
            {popupContents}
          </PopoverContent>
        </Popover>
      );
  }
}

export default EmbedFixedAgentClient;
