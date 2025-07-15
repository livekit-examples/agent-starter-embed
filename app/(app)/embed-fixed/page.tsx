import { headers } from 'next/headers';
import { getAppConfig, getOrigin } from '@/lib/env';
import EmbedFixedAgentClient from '@/components/embed-fixed/agent-client';

export default async function EmbedFixed() {
  const hdrs = await headers();
  const origin = getOrigin(hdrs);

  // FIXME: what is this appConfig thing used for? Do I need it for the embed?
  const appConfig = await getAppConfig(origin);

  return (
    <EmbedFixedAgentClient appConfig={appConfig} />
  );
}
