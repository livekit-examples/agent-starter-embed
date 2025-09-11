import { Track } from 'livekit-client';
import {
  BarVisualizer,
  type TrackReferenceOrPlaceholder,
  useTrackToggle,
} from '@livekit/components-react';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { cn } from '@/lib/utils';

interface MicrophoneToggleProps {
  micTrackRef: TrackReferenceOrPlaceholder;
  microphoneToggle: ReturnType<typeof useTrackToggle<Track.Source.Microphone>>;
  handleAudioDeviceChange: (deviceId: string) => void;
}

export function MicrophoneToggle({
  microphoneToggle,
  micTrackRef,
  handleAudioDeviceChange,
}: MicrophoneToggleProps) {
  return (
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
  );
}
