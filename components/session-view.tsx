'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Track } from 'livekit-client';
import {
  type AgentState,
  type ReceivedChatMessage,
  useRoomContext,
  useVoiceAssistant,
  BarVisualizer,
  useRemoteParticipants,
} from '@livekit/components-react';
import { ChatTextIcon, PhoneDisconnectIcon } from '@phosphor-icons/react/dist/ssr';

import { toastAlert } from '@/components/alert-toast';
import { ChatInput } from '@/components/livekit/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { UseAgentControlBarProps, useAgentControlBar } from '@/components/livekit/agent-control-bar/hooks/use-agent-control-bar';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { ChatMessageView } from '@/components/livekit/chat/chat-message-view';
import { MediaTiles } from '@/components/livekit/media-tiles';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
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
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    // videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(false);
  const { messages, send } = useChatAndTranscription();
  const room = useRoomContext();

  useDebugMode();

  async function handleSendMessage(message: string) {
    await send(message);
  }

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
      {/* <ChatMessageView */}
      {/*   className={cn( */}
      {/*     'mx-auto min-h-svh w-[240px] px-3 pt-32 pb-40 transition-[opacity,translate] duration-300 ease-out md:px-0 md:pt-36 md:pb-48', */}
      {/*     chatOpen ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-20 opacity-0' */}
      {/*   )} */}
      {/* > */}
      {/*   <div className="space-y-3 whitespace-pre-wrap"> */}
      {/*     <AnimatePresence> */}
      {/*       {messages.map((message: ReceivedChatMessage) => ( */}
      {/*         <motion.div */}
      {/*           key={message.id} */}
      {/*           initial={{ opacity: 0, height: 0 }} */}
      {/*           animate={{ opacity: 1, height: 'auto' }} */}
      {/*           exit={{ opacity: 1, height: 'auto', translateY: 0.001 }} */}
      {/*           transition={{ duration: 0.5, ease: 'easeOut' }} */}
      {/*         > */}
      {/*           <ChatEntry hideName key={message.id} entry={message} /> */}
      {/*         </motion.div> */}
      {/*       ))} */}
      {/*     </AnimatePresence> */}
      {/*   </div> */}
      {/* </ChatMessageView> */}

      {/* <div className="bg-background mp-12 fixed top-0 right-0 left-0 h-32 md:h-36"> */}
      {/*   {/* skrim */}
      {/*   <div className="from-background absolute bottom-0 left-0 h-12 w-full translate-y-full bg-gradient-to-b to-transparent" /> */}
      {/* </div> */}

      {/* <MediaTiles chatOpen={chatOpen} /> */}

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
          onSendMessage={handleSendMessage}
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
  onSendMessage?: (message: string) => Promise<void>;
  onDisconnect?: () => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

export function AgentControlBar({
  controls,
  saveUserChoices = true,
  capabilities,
  isPreConnectBufferEnabled,
  className,
  onSendMessage,
  onChatOpenChange,
  onDisconnect,
  onDeviceError,
  ...props
}: AgentControlBarProps) {
  const participants = useRemoteParticipants();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);

  const isAgentAvailable = participants.some((p) => p.isAgent);
  const isInputDisabled = !chatOpen || !isAgentAvailable || isSendingMessage;

  const { audioTrack: agentAudioTrack } = useVoiceAssistant();

  const {
    micTrackRef,
    visibleControls,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleDisconnect,
  } = useAgentControlBar({
    controls,
    saveUserChoices,
  });

  const handleSendMessage = async (message: string) => {
    setIsSendingMessage(true);
    try {
      await onSendMessage?.(message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const onLeave = () => {
    handleDisconnect();
    onDisconnect?.();
  };

  React.useEffect(() => {
    onChatOpenChange?.(chatOpen);
  }, [chatOpen, onChatOpenChange]);

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn('absolute inset-0', className)}
      {...props}
    >
      {/* {capabilities.supportsChatInput && ( */}
      {/*   <div */}
      {/*     inert={!chatOpen} */}
      {/*     className={cn( */}
      {/*       'overflow-hidden transition-[height] duration-300 ease-out', */}
      {/*       chatOpen ? 'h-[57px]' : 'h-0' */}
      {/*     )} */}
      {/*   > */}
      {/*     <div className="flex h-8 w-full"> */}
      {/*       <ChatInput onSend={handleSendMessage} disabled={isInputDisabled} className="w-full" /> */}
      {/*     </div> */}
      {/*     <hr className="border-bg2 my-3" /> */}
      {/*   </div> */}
      {/* )} */}

      <div className="flex flex-row items-center justify-between h-full gap-1 px-3">
        <div className="flex gap-1">
          {visibleControls.microphone && (
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
          )}

          {/* {capabilities.supportsVideoInput && visibleControls.camera && ( */}
          {/*   <div className="flex items-center gap-0"> */}
          {/*     <TrackToggle */}
          {/*       variant="primary" */}
          {/*       source={Track.Source.Camera} */}
          {/*       pressed={cameraToggle.enabled} */}
          {/*       pending={cameraToggle.pending} */}
          {/*       disabled={cameraToggle.pending} */}
          {/*       onPressedChange={cameraToggle.toggle} */}
          {/*       className="peer/track relative w-auto rounded-r-none pr-3 pl-3 disabled:opacity-100 md:border-r-0 md:pr-2" */}
          {/*     /> */}
          {/*     <hr className="bg-separator1 peer-data-[state=off]/track:bg-separatorSerious relative z-10 -mr-px hidden h-4 w-px md:block" /> */}
          {/*     <DeviceSelect */}
          {/*       size="sm" */}
          {/*       kind="videoinput" */}
          {/*       onError={(error) => */}
          {/*         onDeviceError?.({ source: Track.Source.Camera, error: error as Error }) */}
          {/*       } */}
          {/*       onActiveDeviceChange={handleVideoDeviceChange} */}
          {/*       className={cn([ */}
          {/*         'pl-2', */}
          {/*         'peer-data-[state=off]/track:text-destructive-foreground', */}
          {/*         'hover:text-fg1 focus:text-fg1', */}
          {/*         'hover:peer-data-[state=off]/track:text-destructive-foreground focus:peer-data-[state=off]/track:text-destructive-foreground', */}
          {/*         'rounded-l-none', */}
          {/*       ])} */}
          {/*     /> */}
          {/*   </div> */}
          {/* )} */}

          {/* {capabilities.supportsScreenShare && visibleControls.screenShare && ( */}
          {/*   <div className="flex items-center gap-0"> */}
          {/*     <TrackToggle */}
          {/*       variant="secondary" */}
          {/*       source={Track.Source.ScreenShare} */}
          {/*       pressed={screenShareToggle.enabled} */}
          {/*       disabled={screenShareToggle.pending} */}
          {/*       onPressedChange={screenShareToggle.toggle} */}
          {/*       className="relative w-auto" */}
          {/*     /> */}
          {/*   </div> */}
          {/* )} */}

          {/* {visibleControls.chat && ( */}
          {/*   <Toggle */}
          {/*     variant="secondary" */}
          {/*     aria-label="Toggle chat" */}
          {/*     pressed={chatOpen} */}
          {/*     onPressedChange={setChatOpen} */}
          {/*     disabled={!isAgentAvailable} */}
          {/*     className="aspect-square h-full" */}
          {/*   > */}
          {/*     <ChatTextIcon weight="bold" /> */}
          {/*   </Toggle> */}
          {/* )} */}
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

        {visibleControls.leave && (
          <Button variant="destructive" onClick={onLeave} className="font-mono">
            <PhoneDisconnectIcon weight="bold" />
            <span className="hidden md:inline upperca">END CALL</span>
            <span className="inline md:hidden">END</span>
          </Button>
        )}
      </div>
    </div>
  );
}
