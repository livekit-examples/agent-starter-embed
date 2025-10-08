'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { Track } from 'livekit-client';
import { BarVisualizer, useRemoteParticipants } from '@livekit/components-react';
import { ChatTextIcon } from '@phosphor-icons/react/dist/ssr';
import { ChatInput } from '@/components/livekit/chat/chat-input';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { Toggle } from '@/components/ui/toggle';
import { UseAgentControlBarProps, useAgentControlBar } from '@/hooks/use-agent-control-bar';
import { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface AgentControlBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    UseAgentControlBarProps {
  capabilities: Pick<AppConfig, 'supportsChatInput' | 'supportsVideoInput' | 'supportsScreenShare'>;
  onChatOpenChange?: (open: boolean) => void;
  onSendMessage?: (message: string) => Promise<void>;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

/**
 * A control bar specifically designed for voice assistant interfaces
 */
export function ActionBar({
  controls,
  saveUserChoices = true,
  capabilities,
  className,
  onSendMessage,
  onChatOpenChange,
  onDeviceError,
  ...props
}: AgentControlBarProps) {
  const participants = useRemoteParticipants();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);

  const isAgentAvailable = participants.some((p) => p.isAgent);
  const isInputDisabled = !chatOpen || !isAgentAvailable || isSendingMessage;

  const {
    micTrackRef,
    visibleControls,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
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

  React.useEffect(() => {
    onChatOpenChange?.(chatOpen);
  }, [chatOpen, onChatOpenChange]);

  const onMicrophoneDeviceSelectError = useCallback(
    (error: Error) => {
      onDeviceError?.({ source: Track.Source.Microphone, error });
    },
    [onDeviceError]
  );
  const onCameraDeviceSelectError = useCallback(
    (error: Error) => {
      onDeviceError?.({ source: Track.Source.Camera, error });
    },
    [onDeviceError]
  );

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        'bg-background border-separator1 dark:border-separator1 relative z-20 mx-2 mb-2 flex flex-col rounded-[24px] border p-1 drop-shadow-md',
        className
      )}
      {...props}
    >
      {capabilities.supportsChatInput && (
        <div
          inert={!chatOpen}
          className={cn(
            'relative overflow-hidden transition-[height] duration-300 ease-out',
            chatOpen ? 'h-[46px]' : 'h-0'
          )}
        >
          <div
            className={cn(
              'absolute inset-x-0 top-0 flex h-9 w-full transition-opacity duration-150 ease-linear',
              chatOpen ? 'opacity-100 delay-150' : 'opacity-0'
            )}
          >
            <ChatInput onSend={handleSendMessage} disabled={isInputDisabled} className="w-full" />
          </div>
          <hr className="border-bg2 absolute inset-x-0 bottom-0 my-1 w-full" />
        </div>
      )}

      <div className="flex flex-row justify-between gap-1">
        <div className="flex gap-1">
          {visibleControls.microphone && (
            <div className="flex items-center gap-0">
              <TrackToggle
                variant="primary"
                source={Track.Source.Microphone}
                pressed={microphoneToggle.enabled}
                disabled={microphoneToggle.pending}
                onPressedChange={microphoneToggle.toggle}
                className="peer/track group/track relative w-auto pr-3 pl-3 has-[+_*]:rounded-r-none has-[+_*]:border-r-0 has-[+_*]:pr-2"
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
              <DeviceSelect
                size="sm"
                kind="audioinput"
                requestPermissions={false}
                onMediaDeviceError={onMicrophoneDeviceSelectError}
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

          {capabilities.supportsVideoInput && visibleControls.camera && (
            <div className="flex items-center gap-0">
              <TrackToggle
                variant="primary"
                source={Track.Source.Camera}
                pressed={cameraToggle.enabled}
                pending={cameraToggle.pending}
                disabled={cameraToggle.pending}
                onPressedChange={cameraToggle.toggle}
                className="peer/track relative w-auto pr-3 pl-3 disabled:opacity-100 has-[+_*]:rounded-r-none has-[+_*]:border-r-0 has-[+_*]:pr-2"
              />
              <DeviceSelect
                size="sm"
                kind="videoinput"
                requestPermissions={false}
                onMediaDeviceError={onCameraDeviceSelectError}
                onActiveDeviceChange={handleVideoDeviceChange}
                className={cn([
                  'pl-2',
                  'peer-data-[state=off]/track:text-destructive-foreground',
                  'hover:text-fg1 focus:text-fg1',
                  'hover:peer-data-[state=off]/track:text-destructive-foreground focus:peer-data-[state=off]/track:text-destructive-foreground',
                  'rounded-l-none',
                ])}
              />
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {capabilities.supportsScreenShare && visibleControls.screenShare && (
            <div className="flex items-center gap-0">
              <TrackToggle
                variant="secondary"
                source={Track.Source.ScreenShare}
                pressed={screenShareToggle.enabled}
                disabled={screenShareToggle.pending}
                onPressedChange={screenShareToggle.toggle}
                className="relative w-auto"
              />
            </div>
          )}

          {visibleControls.chat && (
            <Toggle
              variant="secondary"
              aria-label="Toggle chat"
              pressed={chatOpen}
              onPressedChange={setChatOpen}
              disabled={!isAgentAvailable}
              className="aspect-square h-full"
            >
              <ChatTextIcon weight="bold" />
            </Toggle>
          )}
        </div>
      </div>
    </div>
  );
}
