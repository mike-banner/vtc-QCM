export const prerender = false;

import type { APIRoute } from 'astro';
import { onboardingSchema } from '../../lib/schema';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        // Validation finale côté serveur (sécurité)
        const parsedData = onboardingSchema.safeParse(data);

        if (!parsedData.success) {
            return new Response(JSON.stringify({
                message: 'Données invalides',
                errors: parsedData.error.errors
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // TODO: Envoyer vers n8n Webhook
        // const webhookUrl = 'https://n8n.example.com/webhook/vtc-onboarding';
        // await fetch(webhookUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(parsedData.data)
        // });

        // Pour l'instant, on simule une réussite
        console.log('Valid Submission:', parsedData.data);

        return new Response(JSON.stringify({
            success: true,
            message: 'Dossier reçu avec succès'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ message: 'Erreur serveur' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
