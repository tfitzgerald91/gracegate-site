import { createHash, createSign } from 'node:crypto';

// CloudKit configuration — Grace Gate Check-In container
const CONTAINER = 'iCloud.com.gracegatecheckin.app';
const ENVIRONMENT = 'development'; // TODO: switch to 'production' before launch
const KEY_ID = '6682cc926b6f3a8b0b6222e4eb20354d2f790953258e07c9f18389a800ad8065';
const CLOUDKIT_URL = `https://api.apple-cloudkit.com/database/1/${CONTAINER}/${ENVIRONMENT}/public/records/modify`;
const CLOUDKIT_QUERY_URL = `https://api.apple-cloudkit.com/database/1/${CONTAINER}/${ENVIRONMENT}/public/records/query`;
const SUBPATH_MODIFY = `/database/1/${CONTAINER}/${ENVIRONMENT}/public/records/modify`;
const SUBPATH_QUERY = `/database/1/${CONTAINER}/${ENVIRONMENT}/public/records/query`;

function todayDateKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function signRequest(body, keyData, subpath) {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const bodyHash = createHash('sha256').update(body).digest('base64');
  const message = `${now}:${bodyHash}:${subpath}`;

  const clean = keyData.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  const pem = '-----BEGIN PRIVATE KEY-----\n' +
    clean.match(/.{1,64}/g).join('\n') +
    '\n-----END PRIVATE KEY-----\n';

  const signer = createSign('SHA256');
  signer.update(message);
  const signature = signer.sign(pem, 'base64');

  return { date: now, signature };
}

async function cloudKitModify(body, privateKey) {
  const { date, signature } = signRequest(body, privateKey, SUBPATH_MODIFY);
  const resp = await fetch(CLOUDKIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Apple-CloudKit-Request-KeyID': KEY_ID,
      'X-Apple-CloudKit-Request-ISO8601Date': date,
      'X-Apple-CloudKit-Request-SignatureV1': signature
    },
    body
  });
  const data = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, data };
}

// ============================================================
// API Handlers
// ============================================================

// --- Family CRUD ---

async function handleSaveFamily(request, env) {
  const privateKey = env.CLOUDKIT_PRIVATE_KEY || '';
  if (!privateKey) return Response.json({ error: 'Server not configured' }, { status: 500 });

  const { kioskDeviceId, family } = await request.json();
  if (!kioskDeviceId || !family || !family.id || !family.lastName) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const recordName = `family-${kioskDeviceId}-${family.id}`;
  const body = JSON.stringify({
    operations: [{
      operationType: 'forceReplace',
      record: {
        recordType: 'GGFamily',
        recordName,
        fields: {
          familyId: { value: family.id },
          kioskDeviceId: { value: kioskDeviceId },
          lastName: { value: family.lastName },
          phone: { value: family.phone || '' },
          membersJSON: { value: JSON.stringify(family.members || []) },
          updatedAt: { value: Date.now() }
        }
      }
    }]
  });

  const result = await cloudKitModify(body, privateKey);
  if (!result.ok) return Response.json({ error: 'CloudKit error', detail: result.data }, { status: result.status });
  return Response.json({ success: true });
}

async function handleDeleteFamily(request, env) {
  const privateKey = env.CLOUDKIT_PRIVATE_KEY || '';
  if (!privateKey) return Response.json({ error: 'Server not configured' }, { status: 500 });

  const { kioskDeviceId, familyId } = await request.json();
  if (!kioskDeviceId || !familyId) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const recordName = `family-${kioskDeviceId}-${familyId}`;
  const body = JSON.stringify({
    operations: [{
      operationType: 'forceDelete',
      record: { recordType: 'GGFamily', recordName }
    }]
  });

  const result = await cloudKitModify(body, privateKey);
  return Response.json({ success: true });
}

// --- Check-In ---

async function handleCheckIn(request, env) {
  const privateKey = env.CLOUDKIT_PRIVATE_KEY || '';
  if (!privateKey) return Response.json({ error: 'Server not configured' }, { status: 500 });

  const data = await request.json();
  const { kioskDeviceId, checkIn, sessionId } = data;
  if (!kioskDeviceId || !checkIn || !checkIn.id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const dateKey = data.dateKey || todayDateKey();
  const recordName = `checkin-${kioskDeviceId}-${checkIn.id}`;
  const body = JSON.stringify({
    operations: [{
      operationType: 'forceReplace',
      record: {
        recordType: 'GGCheckIn',
        recordName,
        fields: {
          checkInId: { value: checkIn.id },
          kioskDeviceId: { value: kioskDeviceId },
          familyId: { value: checkIn.familyId || '' },
          memberId: { value: checkIn.memberId || '' },
          memberName: { value: checkIn.memberName || '' },
          classroom: { value: checkIn.classroom || '' },
          securityCode: { value: checkIn.securityCode || '' },
          checkedInAt: { value: checkIn.checkedInAt || Date.now() },
          allergies: { value: checkIn.allergies || '' },
          medicalNotes: { value: checkIn.medicalNotes || '' },
          sessionId: { value: sessionId || '' },
          dateKey: { value: dateKey },
          isCheckedOut: { value: checkIn.isCheckedOut ? 1 : 0 }
        }
      }
    }]
  });

  const result = await cloudKitModify(body, privateKey);
  if (!result.ok) return Response.json({ error: 'CloudKit error' }, { status: result.status });
  return Response.json({ success: true });
}

async function handleCheckOut(request, env) {
  const privateKey = env.CLOUDKIT_PRIVATE_KEY || '';
  if (!privateKey) return Response.json({ error: 'Server not configured' }, { status: 500 });

  const { kioskDeviceId, checkInId } = await request.json();
  if (!kioskDeviceId || !checkInId) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const recordName = `checkin-${kioskDeviceId}-${checkInId}`;
  const body = JSON.stringify({
    operations: [{
      operationType: 'forceReplace',
      record: {
        recordType: 'GGCheckIn',
        recordName,
        fields: {
          isCheckedOut: { value: 1 },
          checkedOutAt: { value: Date.now() }
        }
      }
    }]
  });

  const result = await cloudKitModify(body, privateKey);
  if (!result.ok) return Response.json({ error: 'CloudKit error' }, { status: result.status });
  return Response.json({ success: true });
}

// --- Session ---

async function handleSaveSession(request, env) {
  const privateKey = env.CLOUDKIT_PRIVATE_KEY || '';
  if (!privateKey) return Response.json({ error: 'Server not configured' }, { status: 500 });

  const { kioskDeviceId, session } = await request.json();
  if (!kioskDeviceId || !session || !session.id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const recordName = `session-${kioskDeviceId}-${session.id}`;
  const body = JSON.stringify({
    operations: [{
      operationType: 'forceReplace',
      record: {
        recordType: 'GGSession',
        recordName,
        fields: {
          sessionId: { value: session.id },
          kioskDeviceId: { value: kioskDeviceId },
          name: { value: session.name || '' },
          date: { value: session.date || Date.now() },
          dateKey: { value: session.dateKey || todayDateKey() },
          totalCount: { value: session.totalCount || 0 },
          recordsJSON: { value: JSON.stringify(session.records || []) },
          updatedAt: { value: Date.now() }
        }
      }
    }]
  });

  const result = await cloudKitModify(body, privateKey);
  if (!result.ok) return Response.json({ error: 'CloudKit error' }, { status: result.status });
  return Response.json({ success: true });
}

// ============================================================
// Router
// ============================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // --- API Routes ---
    try {
      if (url.pathname === '/api/family' && request.method === 'POST') {
        const resp = await handleSaveFamily(request, env);
        return new Response(resp.body, { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (url.pathname === '/api/family' && request.method === 'DELETE') {
        const resp = await handleDeleteFamily(request, env);
        return new Response(resp.body, { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (url.pathname === '/api/checkin' && request.method === 'POST') {
        const resp = await handleCheckIn(request, env);
        return new Response(resp.body, { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (url.pathname === '/api/checkout' && request.method === 'POST') {
        const resp = await handleCheckOut(request, env);
        return new Response(resp.body, { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
      if (url.pathname === '/api/session' && request.method === 'POST') {
        const resp = await handleSaveSession(request, env);
        return new Response(resp.body, { status: resp.status, headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      // Waitlist
      if (url.pathname === '/api/waitlist' && request.method === 'POST') {
        const { email } = await request.json();
        if (!email || !email.includes('@')) {
          return Response.json({ error: 'Valid email required' }, { status: 400, headers: cors });
        }
        const key = `waitlist:${email.toLowerCase().trim()}`;
        if (!(await env.WAITLIST.get(key))) {
          await env.WAITLIST.put(key, JSON.stringify({ email: email.toLowerCase().trim(), signedUpAt: new Date().toISOString() }));
        }
        return Response.json({ success: true }, { headers: cors });
      }
      if (url.pathname === '/api/waitlist' && request.method === 'GET') {
        const list = await env.WAITLIST.list({ prefix: 'waitlist:' });
        const entries = await Promise.all(list.keys.map(async k => {
          const val = await env.WAITLIST.get(k.name);
          return val ? JSON.parse(val) : null;
        }));
        return Response.json(entries.filter(Boolean), { headers: cors });
      }

      if (url.pathname.startsWith('/api/')) {
        return Response.json({ error: 'Not found' }, { status: 404, headers: cors });
      }
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500, headers: cors });
    }

    // --- Page Routes ---
    if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
      url.pathname = '/dashboard.html';
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
