// functions/_middleware.ts
// Cloudflare Pages Middleware
export const onRequest = async (context) => {
  try {
    return await context.next();
  } catch (err) {
    return new Response(err.message || err.toString(), {
      status: 500,
    });
  }
};
