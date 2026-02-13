// /home/mike/projects/vtc/vtc-questions/src/pages/api/admin/update-entreprise.ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { DirectusClient } from '../../../lib/directus';
import { isAuthenticated } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
    if (!isAuthenticated(cookies)) {
        return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, hub_id } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID requis' }), { status: 400 });
        }

        const directus = new DirectusClient();

        // Si un hub_id est fourni, on change aussi l'account_type en 'driver' (team member)
        const updateData: any = {
            hub_id: hub_id || null,
        };

        if (hub_id) {
            updateData.account_type = 'driver';
        } else {
            updateData.account_type = 'solo';
        }

        const success = await directus.updateEntreprise(id, updateData);

        if (success) {
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: 'Échec de la mise à jour de l\'entreprise' }), { status: 500 });
        }
    } catch (error) {
        console.error('Erreur API Update Entreprise:', error);
        return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 });
    }
};
