export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- API Routes ---

    // Waitlist signup
    if (url.pathname === '/api/waitlist' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        if (!email || !email.includes('@')) {
          return Response.json({ error: 'Valid email required' }, { status: 400 });
        }
        const key = `waitlist:${email.toLowerCase().trim()}`;
        const existing = await env.WAITLIST.get(key);
        if (!existing) {
          await env.WAITLIST.put(key, JSON.stringify({
            email: email.toLowerCase().trim(),
            signedUpAt: new Date().toISOString(),
          }));
        }
        return Response.json({ success: true });
      } catch {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
      }
    }

    // List waitlist (simple admin view)
    if (url.pathname === '/api/waitlist' && request.method === 'GET') {
      const list = await env.WAITLIST.list({ prefix: 'waitlist:' });
      const entries = await Promise.all(
        list.keys.map(async (k) => {
          const val = await env.WAITLIST.get(k.name);
          return val ? JSON.parse(val) : null;
        })
      );
      return Response.json(entries.filter(Boolean));
    }

    // Other API routes (to be implemented)
    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not implemented' }, { status: 501 });
    }

    // --- Page Routes ---

    // Dashboard route
    if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
      url.pathname = '/dashboard.html';
      return env.ASSETS.fetch(new Request(url, request));
    }

    // Static assets handled by wrangler (/ serves index.html = landing page)
    return env.ASSETS.fetch(request);
  },
};
