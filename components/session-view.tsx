'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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
import { UseAgentControlBarProps, useAgentControlBar } from '@/components/livekit/agent-control-bar/hooks/use-agent-control-bar';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

interface SessionViewProps {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
}

export const SessionView = ({
  appConfig,
  disabled,
  sessionStarted,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const { state: agentState } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(false);
  const room = useRoomContext();

  useDebugMode();

  useEffect(() => {
    if (sessionStarted) {
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
    }
  }, [agentState, sessionStarted, room]);

  const { supportsChatInput, supportsVideoInput, supportsScreenShare } = appConfig;
  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  return (
    <main
      ref={ref}
      inert={disabled}
      className={
        // prevent page scrollbar
        // when !chatOpen due to 'translate-y-20'
        cn(!chatOpen && 'max-h-svh overflow-hidden')
      }
    >
      <motion.div
        key="control-bar"
        initial={{ opacity: 0 }}
        animate={{
          opacity: sessionStarted ? 1 : 0,
        }}
        transition={{ duration: 0.3, delay: sessionStarted ? 0.5 : 0, ease: 'easeOut' }}
      >
        <AgentControlBar
          capabilities={capabilities}
          onChatOpenChange={setChatOpen}
          isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
        />
      </motion.div>
    </main>
  );
};

export interface AgentControlBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    UseAgentControlBarProps {
  capabilities: Pick<AppConfig, 'supportsChatInput' | 'supportsVideoInput' | 'supportsScreenShare'>;
  isPreConnectBufferEnabled: boolean;
  onChatOpenChange?: (open: boolean) => void;
  onDisconnect?: () => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

export function AgentControlBar({
  controls,
  saveUserChoices = true,
  capabilities,
  isPreConnectBufferEnabled,
  className,
  onChatOpenChange,
  onDisconnect,
  onDeviceError,
  ...props
}: AgentControlBarProps) {
  const { audioTrack: agentAudioTrack } = useVoiceAssistant();
  const {
    micTrackRef,
    visibleControls,
    microphoneToggle,
    handleAudioDeviceChange,
    handleDisconnect,
  } = useAgentControlBar({
    controls,
    saveUserChoices,
  });

  const onLeave = () => {
    handleDisconnect();
    onDisconnect?.();
  };

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn('absolute inset-0', className)}
      {...props}
    >
      <div className="flex flex-row items-center justify-between h-full gap-1 px-3">
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
                onError={(error) =>
                  onDeviceError?.({ source: Track.Source.Microphone, error: error as Error })
                }
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
        </div>

        {isPreConnectBufferEnabled ? (
          <div className="absolute left-1/2 -translate-x-1/2 h-full flex justify-center items-center gap-2">
            <BarVisualizer
              barCount={3}
              trackRef={agentAudioTrack}
              options={{ minHeight: 5 }}
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
              Agent listening
            </p>
          </div>
        ) : null}

        {visibleControls.leave ? (
          <Button variant="destructive" onClick={onLeave} className="font-mono">
            <PhoneDisconnectIcon weight="bold" />
            <span className="hidden md:inline uppercase">End Call</span>
            <span className="inline md:hidden uppercase">End</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
