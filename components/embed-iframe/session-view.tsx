'use client';

import React, { useEffect } from 'react';
import { Track } from 'livekit-client';
import { motion } from 'motion/react';
import {
  type AgentState,
  BarVisualizer,
  useRoomContext,
  useVoiceAssistant,
} from '@livekit/components-react';
import { PhoneDisconnectIcon } from '@phosphor-icons/react/dist/ssr';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { Button } from '@/components/ui/button';
import { useAgentControlBar } from '@/hooks/use-agent-control-bar';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig } from '@/lib/types';
import { EmbedErrorDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

type SessionViewProps = {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
  onDisplayError: (newError: EmbedErrorDetails) => void;
};

export const SessionView = ({
  appConfig,
  disabled,
  sessionStarted,
  onDisplayError,
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
    saveUserChoices: true,
  });

  const onLeave = () => {
    handleDisconnect();
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

        onDisplayError({
          title: 'Session ended',
          description: <p className="w-full">{reason}</p>,
        });
        room.disconnect();
      }
    }, 20_000);

    return () => clearTimeout(timeout);
  }, [agentState, sessionStarted, room, onDisplayError]);

  return (
    <div ref={ref} inert={disabled}>
      <motion.div
        key="control-bar"
        initial={{ opacity: 0 }}
        animate={{
          opacity: sessionStarted ? 1 : 0,
        }}
        transition={{ duration: 0.3, delay: sessionStarted ? 0.5 : 0, ease: 'easeOut' }}
      >
        <div aria-label="Voice assistant controls" className="absolute inset-0">
          <div className="flex h-full flex-row items-center justify-between gap-1 px-3">
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
                    // onError={(error) =>
                    //   onDeviceError?.({ source: Track.Source.Microphone, error: error as Error })
                    // }
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

            {appConfig.isPreConnectBufferEnabled ? (
              <div className="absolute left-1/2 flex h-full -translate-x-1/2 items-center justify-center gap-2">
                <BarVisualizer
                  barCount={3}
                  trackRef={agentAudioTrack}
                  options={{ minHeight: 5 }}
                  className="absolute -left-5 flex h-6 w-auto items-center justify-center gap-0.5"
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
                <span className="hidden uppercase md:inline">End Call</span>
                <span className="inline uppercase md:hidden">End</span>
              </Button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
