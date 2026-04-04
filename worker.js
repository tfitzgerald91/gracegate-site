export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API routes (to be implemented)
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not implemented' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Static assets handled by wrangler
    return env.ASSETS.fetch(request);
  },
};
