'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Track } from 'livekit-client';
import {
  type AgentState,
  useRoomContext,
  useVoiceAssistant,
  BarVisualizer,
} from '@livekit/components-react';
import { PhoneDisconnectIcon } from '@phosphor-icons/react/dist/ssr';

import { toastAlert } from '@/components/alert-toast';
import { Button } from '@/components/ui/button';
import { useAgentControlBar } from '@/components/livekit/agent-control-bar/hooks/use-agent-control-bar';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import useChatAndTranscription from '@/hooks/use-chat-and-transcription';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { ChatInput } from '../livekit/chat/chat-input';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

type SessionViewProps = {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
};

export const PopupView = ({
  appConfig,
  disabled,
  sessionStarted,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const room = useRoomContext();
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const {
    micTrackRef,
    // FIXME: how do I explicitly ensure only the microphone channel is used?
    visibleControls,
    microphoneToggle,
    handleAudioDeviceChange,
    handleDisconnect,
  } = useAgentControlBar({
    controls: { microphone: true },
    saveUserChoices: true
  });
  const { messages, send } = useChatAndTranscription();

  const onLeave = () => {
    handleDisconnect();
  };

  const onSend = (message: string) => {
    send(message);
  };

  useDebugMode();

  // If the agent hasn't connected after an interval, then show an error - something must not be
  // working
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

        toastAlert({
          title: 'Session ended',
          description: (
            <p className="w-full">
              {reason}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.livekit.io/agents/start/voice-ai/"
                className="whitespace-nowrap underline"
              >
                See quickstart guide
              </a>
              .
            </p>
          ),
        });
        room.disconnect();
      }
    }, 10_000);

    return () => clearTimeout(timeout);
  }, [agentState, sessionStarted, room]);

  const showAgentListening = (
    appConfig.isPreConnectBufferEnabled && 
    agentState !== 'disconnected' &&
    agentState !== 'connecting' &&
    agentState !== 'initializing'
  );

  return (
    <div ref={ref} inert={disabled} className="flex flex-col w-full h-full">
      <div className="relative flex flex-col justify-end h-0 p-2 grow-1 shrink-1 overflow-y-auto">
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          initial={false}
          animate={{
            opacity: agentState === 'connecting' ? 1 : 0,
            pointerEvents: agentState === 'connecting' ? 'auto' : 'none',
          }}
        >
          <span className="text-fg1 text-sm font-medium select-none">Connecting...</span>
          <BarVisualizer
            barCount={5}
            state={agentState}
            options={{ minHeight: 5 }}
            className={cn('flex aspect-video w-40 items-center justify-center gap-1')}
          >
            <span
              className={cn([
                'bg-muted min-h-4 w-4 rounded-full',
                'origin-center transition-colors duration-250 ease-linear',
                'data-[lk-highlighted=true]:bg-foreground data-[lk-muted=true]:bg-muted',
              ])}
            />
          </BarVisualizer>
        </motion.div>

        {/* Add spacer at the top to ensure "end" always has room */}
        <div className="mt-4" />

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

        {/* Add spacer at the bottom to ensure "agent listening" always has room */}
        <div className="mb-8" />
      </div>

      {visibleControls.leave ? (
        <div className="absolute top-2 right-2">
          <Button variant="destructive" onClick={onLeave} className="font-mono">
            <PhoneDisconnectIcon weight="bold" />
            <span className="inline uppercase">End</span>
          </Button>
        </div>
      ) : null}

      <div
        aria-label="Voice assistant controls"
        className="relative flex items-center gap-1 px-2 h-12 grow-0 shrink-0"
      >
        <motion.div
          initial={false}
          animate={{
            opacity: showAgentListening ? 1 : 0,
            pointerEvents: showAgentListening ? 'auto' : 'none',
          }}
          className="absolute -top-8 right-2 flex justify-center items-center gap-2 bg-bg2 px-3 py-0.5 rounded-full"
        >
          <BarVisualizer
            barCount={3}
            trackRef={agentAudioTrack}
            options={{ minHeight: 5 }}
            // className="absolute -left-5 flex h-6 w-auto items-center justify-center gap-0.5"
            className="flex h-6 w-auto items-center justify-center gap-0.5"
          >
            <span
              className={cn([
                'h-full w-0.5 origin-center rounded-2xl',
                'bg-fg1',
                'data-lk-muted:bg-muted',
              ])}
            />
          </BarVisualizer>

          <p className="animate-text-shimmer inline-block !bg-clip-text text-sm font-semibold text-transparent">
            Agent listening...
          </p>
        </motion.div>

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

        <ChatInput className="w-0 grow-1 shrink-1" onSend={onSend} />
      </div>
    </div>
  );
};
