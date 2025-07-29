import { ApplyThemeScript } from '@/components/theme-toggle';
import WelcomeDynamic from '@/components/welcome-dynamic';

export default function Page() {
  return (
    <div className="bg-background fixed inset-0 overflow-auto">
      <ApplyThemeScript />
      <WelcomeDynamic />
    </div>
  );
}
