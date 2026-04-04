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

    // Dashboard route
    if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
      url.pathname = '/dashboard.html';
      return env.ASSETS.fetch(new Request(url, request));
    }

    // Static assets handled by wrangler (/ serves index.html = landing page)
    return env.ASSETS.fetch(request);
  },
};
