'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { SessionView } from '@/components/embed/session-view';
import useConnectionDetails from '@/hooks/useConnectionDetails';
import type { AppConfig } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { CaretUpIcon } from '@phosphor-icons/react';

type FixedButtonViewProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const FixedButton = ({ open, onOpen, onClose }: FixedButtonViewProps) => {
  return (
    <div
      className="fixed bottom-4 right-4"
      onClick={() => open ? onClose() : onOpen()}
    >
      <Button
        variant="primary"
        size="lg"
        className="w-12 h-12 p-0 bg-bg3 border"
      >
        {open ? (
          <CaretUpIcon size={24} />
        ) : (
          <>
            <img src="/lk-logo.svg" alt="LiveKit Logo" className="block size-4 dark:hidden" />
            <img src="/lk-logo-dark.svg" alt="LiveKit Logo" className="hidden size-4 dark:block" />
          </>
        )}
      </Button>
    </div>
  );
};

export const Backdrop = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0" onClick={onClose} />
  );
}

export const ManagedFixedButton = () => {
  const [open, setOpen] = useState(false);

  const onOpen = () => {
    setOpen(true);
    window.parent.postMessage(JSON.stringify({type: 'open'}));
  };

  const onClose = () => {
    setOpen(false);
    window.parent.postMessage(JSON.stringify({type: 'close'}));
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <FixedButton open={open} onOpen={onOpen} onClose={onClose} />
    </>
  );
};

export type EmbedFixedAgentClientProps = {
  appConfig: AppConfig;
};

function EmbedFixedAgentClient({ appConfig }: EmbedFixedAgentClientProps) {
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
  return (
    <>
      {/* Backdrop */}
      {popupOpen ? (
        <Backdrop onClose={() => setPopupOpen(false)} />
      ) : null}

      <FixedButton
        open={popupOpen}
        onOpen={() => setPopupOpen(true)}
        onClose={() => setPopupOpen(false)}
      />

      <motion.div
        className="fixed right-4 bottom-20 w-full max-w-[320px] h-[480px] rounded-md bg-bg2"
        initial={false}
        animate={{
          opacity: popupOpen ? 1 : 0,
          translateY: popupOpen ? 0 : 8,
          pointerEvents: popupOpen ? 'auto' : 'none',
        }}
      >
        <RoomContext.Provider value={room}>
          <RoomAudioRenderer />
          <StartAudio label="Start Audio" />

          {/* --- */}

          <SessionView
            key="session-view"
            appConfig={appConfig}
            disabled={!popupOpen}
            sessionStarted={popupOpen}
          />
        </RoomContext.Provider>

        <Toaster />
      </motion.div>
    </>
  );
}

export default EmbedFixedAgentClient;
