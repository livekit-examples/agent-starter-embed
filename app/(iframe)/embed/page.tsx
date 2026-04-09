import { headers } from 'next/headers';
import EmbedAgentClient from '@/components/embed-iframe/agent-client';
import { ApplyThemeScript } from '@/components/embed-iframe/theme-provider';
import { getAppConfig, getOrigin } from '@/lib/env';
import { getStyles } from '@/lib/styles';

export default async function Embed() {
  const hdrs = await headers();
  const origin = getOrigin(hdrs);
  const sandboxId = hdrs.get('x-sandbox-id');
  const appConfig = await getAppConfig(origin, sandboxId ?? undefined);
  const styles = getStyles(appConfig);

  return (
    <>
      <ApplyThemeScript />
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <EmbedAgentClient appConfig={appConfig} />
    </>
  );
}
