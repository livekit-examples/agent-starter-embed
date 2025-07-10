import { headers } from 'next/headers';
import EmbedAgentClient from '@/components/embed/agent-client';
import { getAppConfig, getOrigin } from '@/lib/utils';

export default async function Embed() {
  const hdrs = await headers();
  const origin = getOrigin(hdrs);

  // FIXME: what is this appConfig thing used for? Do I need it for the embed?
  const appConfig = await getAppConfig(origin);

  return (
    <EmbedAgentClient appConfig={appConfig} />
  );
}
