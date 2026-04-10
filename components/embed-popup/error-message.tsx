import type { AppConfig } from '@/lib/types';
import { EmbedErrorDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  appConfig: AppConfig;
  error: EmbedErrorDetails | null;
}

export function ErrorMessage({ appConfig, error }: ErrorMessageProps) {
  const logo = appConfig.logo || '/lk-logo.svg';
  const logoDark = appConfig.logoDark || '/lk-logo-dark.svg';
  const companyName = appConfig.companyName || 'LiveKit';

  return (
    <div
      inert={error === null}
      className={cn(
        'absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center gap-5 transition-opacity',
        error === null ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="pl-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={`${companyName} Logo`} className="block size-6 dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDark} alt={`${companyName} Logo`} className="hidden size-6 dark:block" />
      </div>

      <div className="flex w-full flex-col justify-center gap-4 overflow-auto px-8 text-center">
        <span className="leading-tight font-medium text-pretty">{error?.title}</span>
        <span className="text-sm text-balance">{error?.description}</span>
      </div>
    </div>
  );
}
