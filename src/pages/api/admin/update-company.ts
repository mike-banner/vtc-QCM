// /home/mike/projects/vtc/vtc-questions/src/pages/api/admin/update-company.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { DirectusClient } from '../../../lib/directus';
import { isAuthenticated } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {

    if (!isAuthenticated(cookies)) {
        return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { id, hub_id } = body;

        if (!id) {
            return new Response(
                JSON.stringify({ error: 'ID is required' }),
                { status: 400 }
            );
        }

        const directus = new DirectusClient();

        const updateData: any = {
            hub_id: hub_id || null,
            account_type: hub_id ? 'driver' : 'solo'
        };

        const success = await directus.updateCompany(id, updateData);

        if (!success) {
            return new Response(
                JSON.stringify({ error: 'Failed to update company' }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Update Company API Error:', error);

        return new Response(
            JSON.stringify({ error: 'Server error' }),
            { status: 500 }
        );
    }
};
