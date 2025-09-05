import { getStore } from '@netlify/blobs';

export default async (request, context) => {
    try {
        const adminToken = request.headers.get('x-admin-token') || '';
        const expected = (context.env && context.env.NETLIFY_SAVE_TOKEN) || process.env.NETLIFY_SAVE_TOKEN || '';
        if (!expected || adminToken !== expected) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const bodyText = await request.text();
        let parsed;
        try {
            parsed = JSON.parse(bodyText);
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (!parsed || typeof parsed !== 'object' || !parsed.languages) {
            return new Response(JSON.stringify({ error: 'Invalid config format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const store = getStore('app-config');
        await store.set('config.json', JSON.stringify(parsed), { contentType: 'application/json' });

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message || 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
    }
};



