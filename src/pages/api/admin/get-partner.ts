// /home/mike/projects/vtc/vtc-questions/src/pages/api/admin/get-partner.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { directus } from '../../../lib/directus';

export const GET: APIRoute = async ({ url, cookies }) => {
    // Vérifier l'authentification
    if (!isAuthenticated(cookies)) {
        return new Response(JSON.stringify({ error: 'Non autorisé' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: 'ID manquant' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Récupérer les détails
        const entry = await directus.getOnboardingById(id);

        if (!entry) {
            return new Response(JSON.stringify({ error: 'Partenaire non trouvé' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Convertir les IDs de fichiers en URLs complètes
        if (entry.assurance_url) {
            entry.assurance_url = directus.getFileUrl(entry.assurance_url);
        }
        if (entry.rib_url) {
            entry.rib_url = directus.getFileUrl(entry.rib_url);
        }
        if (entry.carte_grise_url) {
            entry.carte_grise_url = directus.getFileUrl(entry.carte_grise_url);
        }

        return new Response(JSON.stringify(entry), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Erreur récupération partenaire:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
