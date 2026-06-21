import { getCorsOrigin, getCorsHeaders } from '../utils/cors';

interface ClientErrorPayload {
  message?: string;
  stack?: string;
  timestamp?: string;
  url?: string;
}

function scrubPII(input: string): string {
  if (!input) return '';

  // 1. Email address pattern redirection
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // 2. IPv4 Address pattern redirection
  const ipv4Regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

  // 3. Unix/macOS personal home folders (e.g. /Users/john_doe or /home/john_doe)
  const unixHomeRegex = /(\/(?:Users|home)\/)[a-zA-Z0-9._-]+/g;

  // 4. Windows user profile directories (e.g. C:\Users\john_doe)
  const windowsHomeRegex = /([a-zA-Z]:\\Users\\)[a-zA-Z0-9._-]+/g;

  return input
    .replace(emailRegex, '[REDACTED_EMAIL]')
    .replace(ipv4Regex, '[REDACTED_IP]')
    .replace(unixHomeRegex, '$1[REDACTED_USER]')
    .replace(windowsHomeRegex, '$1[REDACTED_USER]');
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const origin = getCorsOrigin(request);
  const corsHeaders = getCorsHeaders(origin);

  // preflight check
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders as HeadersInit,
    });
  }

  if (request.method !== 'POST') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders as HeadersInit,
    });
  }

  try {
    const data = (await request.json()) as ClientErrorPayload;
    const rawMessage = data.message || 'Unknown error';
    const rawStack = data.stack || '';
    const timestamp = data.timestamp || new Date().toISOString();
    const url = data.url || 'unknown-url';

    const cleanMessage = scrubPII(rawMessage);
    const cleanStack = scrubPII(rawStack);

    console.error(`[CLIENT-ERROR-INGESTION]
Timestamp: ${timestamp}
URL: ${url}
Message: ${cleanMessage}
Stack: ${cleanStack}
---------------------------------------------`);
  } catch (err) {
    // Suppress ingestion errors, return 240/204 always
    console.error('Error ingestion service failure:', err);
  }

  // Always return 204 No Content quickly, per specification
  return new Response(null, {
    status: 204,
    headers: corsHeaders as HeadersInit,
  });
};
