// /home/mike/projects/vtc/vtc-questions/src/pages/api/auth/logout.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
    destroySession(cookies);
    return redirect('/', 302);
};
