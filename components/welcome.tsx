import { Button } from '@/components/ui/button';

interface WelcomeProps {
  disabled: boolean;
  startButtonText: string;
  onStartCall: () => void;
}

export const Welcome = ({
  disabled,
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeProps) => {
  return (
    <div
      ref={ref}
      inert={disabled}
      className="absolute inset-0"
    >
      <div className="flex gap-4 items-center justify-between h-full gap-1 px-3">
        <div className="pl-3">
          <img src="/lk-logo.svg" alt="LiveKit Logo" className="block size-6 dark:hidden" />
          <img src="/lk-logo-dark.svg" alt="LiveKit Logo" className="hidden size-6 dark:block" />
        </div>

        <Button variant="primary" size="lg" onClick={onStartCall} className="w-48 font-mono">
          Chat with Agent
        </Button>
      </div>
    </div>
  );
};
