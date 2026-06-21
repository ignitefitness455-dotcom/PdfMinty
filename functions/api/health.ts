export const onRequest: PagesFunction = async (context) => {
  const origin = context.request.headers.get('origin') || '';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers,
    }
  );
};
