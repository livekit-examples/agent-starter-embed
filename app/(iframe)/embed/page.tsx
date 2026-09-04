import EmbedAgentClient from '@/components/embed-iframe/agent-client';
import { ApplyThemeScript } from '@/components/embed-iframe/theme-provider';
import { getAppConfig } from '@/lib/env';
import { getStyles } from '@/lib/styles';

export default async function Embed() {
  const appConfig = await getAppConfig();
  const styles = getStyles(appConfig);

  return (
    <>
      <ApplyThemeScript />
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      <EmbedAgentClient appConfig={appConfig} />
    </>
  );
}
