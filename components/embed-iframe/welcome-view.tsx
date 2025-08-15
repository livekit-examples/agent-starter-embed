import { Button } from '@/components/ui/button';

type WelcomeViewProps = {
  disabled: boolean;
  onStartCall: () => void;
};

export const WelcomeView = ({
  disabled,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} inert={disabled} className="absolute inset-0">
      <div className="flex h-full items-center justify-between gap-4 px-3">
        <div className="pl-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lk-logo.svg" alt="LiveKit Logo" className="block size-6 dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lk-logo-dark.svg" alt="LiveKit Logo" className="hidden size-6 dark:block" />
        </div>

        <Button variant="primary" size="lg" onClick={onStartCall} className="w-48 font-mono">
          Chat with Agent
        </Button>
      </div>
    </div>
  );
};
