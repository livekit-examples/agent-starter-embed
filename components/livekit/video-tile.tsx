import { type TrackReference, VideoTrack } from '@livekit/components-react';
import { cn } from '@/lib/utils';

interface AgentAudioTileProps {
  videoTrack: TrackReference;
  className?: string;
}

export const VideoTile = ({
  videoTrack,
  className,
  ...props
}: AgentAudioTileProps & React.ComponentProps<'video'>) => {
  return (
    <VideoTrack
      {...props}
      trackRef={videoTrack}
      width={videoTrack?.publication.dimensions?.width ?? 0}
      height={videoTrack?.publication.dimensions?.height ?? 0}
      className={cn(className)}
    />
  );
};
