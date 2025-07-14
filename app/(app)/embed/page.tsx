import { headers } from 'next/headers';
import EmbedAgentClient from '@/components/embed/agent-client';
import { getAppConfig, getOrigin } from '@/lib/env';

export default async function Embed() {
  const hdrs = await headers();
  const origin = getOrigin(hdrs);

  const appConfig = await getAppConfig(origin);

  return <EmbedAgentClient appConfig={appConfig} />;
}
