// /home/mike/projects/vtc/vtc-questions/src/pages/api/auth/login.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyPassword, createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    try {
        const formData = await request.formData();
        const password = formData.get('password')?.toString() || '';

        if (verifyPassword(password)) {
            // Créer la session
            createSession(cookies);

            // Rediriger vers /admin
            return redirect('/admin', 302);
        } else {
            // Mot de passe incorrect
            return redirect('/admin?error=invalid', 302);
        }
    } catch (error) {
        console.error('Erreur login:', error);
        return redirect('/admin?error=server', 302);
    }
};
