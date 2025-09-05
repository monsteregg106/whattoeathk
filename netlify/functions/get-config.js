import { getStore } from '@netlify/blobs';

export default async (request, context) => {
    try {
        const store = getStore('app-config');
        const configStr = await store.get('config.json');
        if (!configStr) {
            return new Response(JSON.stringify({ error: 'No config found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
            });
        }
        return new Response(configStr, {
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


