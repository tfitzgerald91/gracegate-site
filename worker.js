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

    // Landing page at root
    if (url.pathname === '/') {
      url.pathname = '/landing.html';
      return env.ASSETS.fetch(new Request(url, request));
    }

    // Dashboard routes — /dashboard maps to index.html (the paired dashboard)
    if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
      url.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }

    // Static assets handled by wrangler
    return env.ASSETS.fetch(request);
  },
};
