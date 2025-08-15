import { RootLayout } from '@/components/root-layout';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: RootLayoutProps) {
  return (
    <RootLayout className="bg-background">
      <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://livekit.io"
          className="scale-100 transition-transform duration-300 hover:scale-110"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lk-logo.svg" alt="LiveKit Logo" className="block size-6 dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lk-logo-dark.svg" alt="LiveKit Logo" className="hidden size-6 dark:block" />
        </a>
        <span className="text-foreground font-mono text-xs font-bold tracking-wider uppercase">
          Built with{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents"
            className="underline underline-offset-4"
          >
            LiveKit Agents
          </a>
        </span>
      </header>
      {children}
      <footer className="fixed bottom-0 left-0 flex w-full justify-center p-6">
        <p className="text-fg1 w-full max-w-prose pt-1 text-center text-xs leading-5 font-normal text-pretty md:text-sm">
          Need help getting set up? Check out the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="underline"
          >
            Voice AI quickstart
          </a>
          .
        </p>
      </footer>
    </RootLayout>
  );
}
