import { ApplyThemeScript } from '@/components/theme-toggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ApplyThemeScript />
      {children}
    </>
  );
}
