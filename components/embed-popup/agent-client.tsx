'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { PopupView } from '@/components/embed-popup/popup-view';
import useConnectionDetails from '@/hooks/use-connection-details';
import type { AppConfig } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CaretDownIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export type EmbedFixedAgentClientProps = {
  appConfig: AppConfig;

  // Choose whether to render the botton fixed in the lower right (the default)
  // or just render it statically. The latter option exists largely for the welcome demo.
  buttonPosition?: 'fixed' | 'static';
};

function EmbedFixedAgentClient({ appConfig, buttonPosition='fixed' }: EmbedFixedAgentClientProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  const room = useMemo(() => new Room(), []);
  const { connectionDetails, refreshConnectionDetails } = useConnectionDetails();

  useEffect(() => {
    const onDisconnected = () => {
      setPopupOpen(false);
      refreshConnectionDetails();
    };
    const onMediaDevicesError = (error: Error) => {
      toastAlert({
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
      } catch (error: any) {
        console.error('Error connecting to agent:', error);
        toastAlert({
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

  // onStartCall={() => setPopupOpen(true)}

  const triggerButton = (
    <Button
      variant="primary"
      size="lg"
      className={cn("w-12 h-12 p-0", {
        "fixed bottom-4 right-4": buttonPosition === 'fixed',
      })}
      onClick={() => popupOpen ? setPopupOpen(false) : setPopupOpen(true)}
    >
      <div className="flex items-center justify-center bg-background w-10 h-10 rounded-full">
        {popupOpen ? (
          <CaretDownIcon size={24} className="text-fg1" />
        ) : (
          <img src="/lk-logo-dark.svg" alt="LiveKit Logo" className="size-4" />
        )}
      </div>
    </Button>
  );

  const popupContents = (
    <>
      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <StartAudio label="Start Audio" />

        {/* --- */}

        <PopupView
          key="popup-view"
          appConfig={appConfig}
          disabled={!popupOpen}
          sessionStarted={popupOpen}
        />
      </RoomContext.Provider>

      <Toaster />
    </>
  );

  switch (buttonPosition) {
    case 'fixed':
      return (
        <>
          {/* Backdrop */}
          {popupOpen ? (
            <div className="fixed inset-0" onClick={() => setPopupOpen(false)} />
          ) : null}

          {triggerButton}

          <motion.div
            className="fixed right-4 bottom-20 w-full max-w-[360px] h-[480px] rounded-md bg-bg2"
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
        <Popover open={popupOpen} onOpenChange={setPopupOpen}>
          <PopoverTrigger asChild>
            {triggerButton}
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-bg2 w-[360px] h-[480px]" align="end">
            {popupContents}
          </PopoverContent>
        </Popover>
      );
    }
}

export default EmbedFixedAgentClient;
