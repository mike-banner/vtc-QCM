// /home/mike/projects/vtc/vtc-questions/src/lib/auth.ts

import type { AstroCookies } from 'astro';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
    const sessionToken = cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return false;
    }

    // Vérification simple du token (hash du mot de passe + secret)
    const expectedToken = generateSessionToken();
    return sessionToken === expectedToken;
}

/**
 * Vérifie si le mot de passe est correct
 */
export function verifyPassword(password: string): boolean {
    const adminPassword = import.meta.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        console.error('⚠️ ADMIN_PASSWORD non défini dans .env');
        return false;
    }

    return password === adminPassword;
}

/**
 * Crée une session pour l'utilisateur
 */
export function createSession(cookies: AstroCookies): void {
    const token = generateSessionToken();

    cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: import.meta.env.PROD, // HTTPS uniquement en production
        sameSite: 'strict',
        maxAge: SESSION_MAX_AGE,
        path: '/'
    });
}

/**
 * Détruit la session de l'utilisateur
 */
export function destroySession(cookies: AstroCookies): void {
    cookies.delete(SESSION_COOKIE_NAME, {
        path: '/'
    });
}

/**
 * Génère un token de session simple (hash du mot de passe + secret)
 */
function generateSessionToken(): string {
    const password = import.meta.env.ADMIN_PASSWORD || '';
    const secret = import.meta.env.SESSION_SECRET || 'default-secret';

    // Hash simple (en production, utilise crypto.subtle.digest)
    return btoa(`${password}:${secret}`);
}
