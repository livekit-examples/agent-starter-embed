'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { ActionBar } from '@/components/embed-popup/action-bar';
import { AudioVisualizer } from '@/components/embed-popup/audio-visualizer';
import { Transcript } from '@/components/embed-popup/transcript';
import useChatAndTranscription from '@/hooks/use-chat-and-transcription';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig, EmbedErrorDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

const TILE_TRANSITION = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
};

const TranscriptMotion = motion.create(Transcript);

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

type PopupProps = {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
  onEmbedError: React.Dispatch<React.SetStateAction<EmbedErrorDetails | null>>;
};

export const PopupView = ({
  appConfig,
  disabled,
  sessionStarted,
  onEmbedError,
  ref,
}: React.ComponentProps<'div'> & PopupProps) => {
  useDebugMode();

  const room = useRoomContext();
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const { isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);
  const [chatOpen, setChatOpen] = useState(false);
  const { messages, send } = useChatAndTranscription();

  const { supportsChatInput, supportsVideoInput, supportsScreenShare } = appConfig;
  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  async function onSendMessage(message: string) {
    await send(message);
    return;
  }

  // If the agent hasn't connected after an interval,
  // then show an error - something must not be working
  useEffect(() => {
    if (!sessionStarted) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!isAgentAvailable(agentState)) {
        const reason =
          agentState === 'connecting'
            ? 'Agent did not join the room. '
            : 'Agent connected but did not complete initializing. ';

        onEmbedError({
          title: 'Session ended',
          description: <p className="w-full">{reason}</p>,
        });
      }
    }, 10_000);

    return () => clearTimeout(timeout);
  }, [agentState, sessionStarted, room, onEmbedError]);

  return (
    <div ref={ref} inert={disabled} className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex h-full shrink-1 grow-1 flex-col">
        {/* Transcript */}
        <TranscriptMotion
          initial={{
            y: 10,
            opacity: 0,
          }}
          animate={{
            y: chatOpen ? 0 : 10,
            opacity: chatOpen ? 1 : 0,
          }}
          transition={{
            type: 'spring',
            duration: 0.5,
            bounce: 0,
          }}
          messages={messages}
        />

        {/* Audio Visualizer */}
        <AnimatePresence>
          {!agentVideoTrack && (
            <motion.div
              key="audio-visualizer"
              initial={{
                scale: 1,
                left: '50%',
                top: '50%',
                translateX: '-50%',
                translateY: '-50%',
                transformOrigin: 'center top',
              }}
              animate={{
                left: chatOpen && (isCameraEnabled || isScreenShareEnabled) ? '39%' : '50%',
                scale: chatOpen ? 0.275 : 1,
                top: chatOpen ? '12px' : '50%',
                translateY: chatOpen ? '0' : '-50%',
                transformOrigin: chatOpen ? 'center top' : 'center center',
              }}
              transition={TILE_TRANSITION}
              className={cn(
                'bg-bg1 dark:bg-bg2 pointer-events-none absolute flex aspect-square w-64 items-center justify-center rounded-2xl border border-transparent transition-colors',
                chatOpen && 'border-separator1 dark:border-separator2 drop-shadow-2xl'
              )}
            >
              <AudioVisualizer agentState={agentState} audioTrack={agentAudioTrack} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar (Background)) */}
        <AnimatePresence>
          {agentVideoTrack && (
            <motion.div
              key="avatar"
              initial={{
                maskImage:
                  'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 40px, transparent 40px)',
                filter: 'blur(20px)',
              }}
              animate={{
                opacity: chatOpen ? 0 : 1,
                maskImage:
                  'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 500px, transparent 500px)',
                filter: 'blur(0px)',
              }}
              transition={{
                opacity: {
                  ease: 'linear',
                  duration: 0.2,
                },
                maskImage: {
                  ease: 'linear',
                  duration: 1,
                },
                filter: {
                  ease: 'linear',
                  duration: 1,
                },
              }}
              className="border-separator1 dark:border-separator2 pointer-events-none absolute inset-1 drop-shadow-lg/20"
            >
              <VideoTrack
                trackRef={agentVideoTrack}
                width={agentVideoTrack?.publication.dimensions?.width ?? 0}
                height={agentVideoTrack?.publication.dimensions?.height ?? 0}
                className="h-full rounded-[24px] bg-black object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar (Tile) */}
        <AnimatePresence>
          {agentVideoTrack && chatOpen && (
            <motion.div
              key="audio-visualizer"
              initial={{
                opacity: 0,
                scale: 0.5,
                left: isCameraEnabled || isScreenShareEnabled ? '39%' : '50%',
                top: '12px',
                translateX: '-50%',
                transformOrigin: 'center top',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                left: isCameraEnabled || isScreenShareEnabled ? '37.5%' : '50%',
              }}
              transition={TILE_TRANSITION}
              className="border-separator1 dark:border-separator2 pointer-events-none absolute drop-shadow-lg/20"
            >
              <VideoTrack
                trackRef={agentVideoTrack}
                width={agentVideoTrack?.publication.dimensions?.width ?? 0}
                height={agentVideoTrack?.publication.dimensions?.height ?? 0}
                className="aspect-square w-[70px] rounded-md bg-black object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera (Tile) */}
        <AnimatePresence>
          {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
            <motion.div
              key="camera"
              initial={{
                scale: 0.5,
                opacity: 0,
                right: '12px',
                top: '346px',
                transformOrigin: 'center bottom',
              }}
              animate={{
                scale: 1,
                opacity: 1,
                top: chatOpen ? '12px' : '346px',
                right: chatOpen ? '106px' : '12px',
                transformOrigin: chatOpen ? 'center top' : 'center bottom',
              }}
              exit={{
                scale: 0.5,
                opacity: 0,
              }}
              transition={TILE_TRANSITION}
              className="border-separator1 dark:border-separator2 pointer-events-none absolute drop-shadow-lg/20"
            >
              <VideoTrack
                trackRef={cameraTrack || screenShareTrack}
                width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                className="aspect-square w-[70px] rounded-md bg-black object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar */}
        <motion.div
          initial={{
            opacity: 0,
            translateY: 8,
          }}
          animate={{
            opacity: sessionStarted ? 1 : 0,
            translateY: sessionStarted ? 0 : 8,
          }}
          transition={{
            delay: 0.5,
          }}
        >
          <ActionBar
            capabilities={capabilities}
            onSendMessage={onSendMessage}
            onChatOpenChange={setChatOpen}
          />
        </motion.div>
      </div>
    </div>
  );
};
