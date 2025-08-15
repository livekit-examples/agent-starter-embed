'use client';

import React, { useEffect, useRef } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  BarVisualizer,
  useRoomContext,
  useVoiceAssistant,
} from '@livekit/components-react';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { useAgentControlBar } from '@/hooks/use-agent-control-bar';
import useChatAndTranscription from '@/hooks/use-chat-and-transcription';
import { useDebugMode } from '@/hooks/useDebug';
import type { EmbedErrorDetails } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatInput } from '../livekit/chat/chat-input';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

type SessionViewProps = {
  disabled: boolean;
  sessionStarted: boolean;
  onDisplayError: (err: EmbedErrorDetails) => void;
};

export const PopupView = ({
  disabled,
  sessionStarted,
  onDisplayError,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const room = useRoomContext();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const {
    micTrackRef,
    // FIXME: how do I explicitly ensure only the microphone channel is used?
    visibleControls,
    microphoneToggle,
    handleAudioDeviceChange,
  } = useAgentControlBar({
    controls: { microphone: true },
    saveUserChoices: true,
  });
  const { messages, send } = useChatAndTranscription();
  const onSend = (message: string) => send(message);

  useDebugMode();

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

        onDisplayError({
          title: 'Session ended',
          description: <p className="w-full">{reason}</p>,
        });
      }
    }, 10_000);

    return () => clearTimeout(timeout);
  }, [agentState, sessionStarted, room, onDisplayError]);

  useEffect(() => {
    function scrollToBottom() {
      const scrollingElement = transcriptRef.current;

      if (scrollingElement) {
        scrollingElement.scrollTop = scrollingElement.scrollHeight;
      }
    }

    if (transcriptRef.current) {
      const resizeObserver = new ResizeObserver(scrollToBottom);

      resizeObserver.observe(transcriptRef.current);
      scrollToBottom();

      return () => resizeObserver.disconnect();
    }
  }, [messages]);

  const agentHasConnected =
    agentState !== 'disconnected' && agentState !== 'connecting' && agentState !== 'initializing';

  return (
    <div ref={ref} inert={disabled} className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex h-full shrink-1 grow-1 flex-col p-1">
        <motion.div
          className={cn(
            'bg-bg2 dark:bg-bg1 pointer-events-none absolute z-10 flex aspect-[1.5] w-64 items-center justify-center rounded-2xl border border-transparent transition-colors',
            agentHasConnected && 'bg-bg1 border-separator1 drop-shadow-2xl'
          )}
          initial={{
            scale: 1,
            left: '50%',
            top: '50%',
            translateX: '-50%',
            translateY: '-50%',
            transformOrigin: 'center top',
          }}
          animate={{
            scale: agentHasConnected ? 0.4 : 1,
            top: agentHasConnected ? '12px' : '50%',
            translateY: agentHasConnected ? '0' : '-50%',
          }}
          transition={{
            type: 'spring',
            stiffness: 675,
            damping: 75,
            mass: 1,
          }}
        >
          <BarVisualizer
            barCount={5}
            state={agentState}
            trackRef={agentAudioTrack}
            options={{ minHeight: 5 }}
            className="flex h-full w-auto items-center justify-center gap-3"
          >
            <span
              className={cn([
                'bg-muted min-h-6 w-6 rounded-full',
                'origin-center transition-colors duration-250 ease-linear',
                'data-[lk-highlighted=true]:bg-foreground data-[lk-muted=true]:bg-muted',
              ])}
            />
          </BarVisualizer>
        </motion.div>

        {/* Transcript */}
        <div
          ref={transcriptRef}
          className="flex flex-1 flex-col overflow-y-auto [mask-image:linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,1)_5%,rgba(0,0,0,1)_95%,rgba(0,0,0,0)_100%)] py-2"
        >
          <div className="flex flex-1 flex-col justify-end gap-2 pt-10">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 1, height: 'auto', translateY: 0.001 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <ChatEntry hideName key={message.id} entry={message} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div
          aria-label="Voice assistant controls"
          className="bg-bg1 border-separator1 relative flex h-12 shrink-0 grow-0 items-center gap-1 rounded-full border px-1 drop-shadow-md"
        >
          <div className="flex gap-1">
            {visibleControls.microphone ? (
              <div className="flex items-center gap-0">
                <TrackToggle
                  variant="primary"
                  source={Track.Source.Microphone}
                  pressed={microphoneToggle.enabled}
                  disabled={microphoneToggle.pending}
                  onPressedChange={microphoneToggle.toggle}
                  className="peer/track group/track relative w-auto pr-3 pl-3 md:rounded-r-none md:border-r-0 md:pr-2"
                >
                  <BarVisualizer
                    barCount={3}
                    trackRef={micTrackRef}
                    options={{ minHeight: 5 }}
                    className="flex h-full w-auto items-center justify-center gap-0.5"
                  >
                    <span
                      className={cn([
                        'h-full w-0.5 origin-center rounded-2xl',
                        'group-data-[state=on]/track:bg-fg1 group-data-[state=off]/track:bg-destructive-foreground',
                        'data-lk-muted:bg-muted',
                      ])}
                    ></span>
                  </BarVisualizer>
                </TrackToggle>
                <hr className="bg-separator1 peer-data-[state=off]/track:bg-separatorSerious relative z-10 -mr-px hidden h-4 w-px md:block" />
                <DeviceSelect
                  size="sm"
                  kind="audioinput"
                  onActiveDeviceChange={handleAudioDeviceChange}
                  className={cn([
                    'pl-2',
                    'peer-data-[state=off]/track:text-destructive-foreground',
                    'hover:text-fg1 focus:text-fg1',
                    'hover:peer-data-[state=off]/track:text-destructive-foreground focus:peer-data-[state=off]/track:text-destructive-foreground',
                    'hidden rounded-l-none md:block',
                  ])}
                />
              </div>
            ) : null}

            {/* FIXME: do I need to handle the other channels here? */}
          </div>

          <ChatInput className="w-0 shrink-1 grow-1" onSend={onSend} />
        </div>
      </div>
    </div>
  );
};
