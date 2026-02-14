// /home/mike/projects/vtc/vtc-questions/src/pages/api/submit.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { onboardingSchema } from '../../lib/schema';

export const POST: APIRoute = async ({ request }) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const data = await request.json();
        const parsed = onboardingSchema.safeParse(data);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({
                    message: 'Données invalides',
                    errors: parsed.error.errors
                }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        const d = parsed.data;

        // Mapping Strict Snake Case pour la DB onboarding_drivers
        const payload = {
            status: "pending",

            first_name: d.firstName,
            last_name: d.lastName,
            email: d.email,
            phone: `${d.phonePrefix}${d.phone}`,
            professional_license_number: d.professionalLicenseNumber,
            company_name: d.companyName,
            account_type: d.accountType,

            vehicle_category: d.vehicleCategory,
            vehicle_model: d.vehicleModel,
            immatriculation: d.immatriculation,
            passenger_capacity: d.passengerCapacity,
            luggage_capacity: d.luggageCapacity,

            pricing_model: d.pricingModel,
            rate_4h: d.rate4h,
            rate_8h: d.rate8h,
            included_km: d.includedKm,
            extra_km_price: d.extraKmPrice,
            deposit_percent: d.depositPercent,
            payment_timing: d.paymentTiming,
            service_area: d.serviceArea
        };

        const baseUrl = import.meta.env.DIRECTUS_URL;
        const token = import.meta.env.DIRECTUS_TOKEN;

        const existing = await fetch(
            `${baseUrl}/items/onboarding_drivers?filter[email][_eq]=${encodeURIComponent(d.email)}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const existingJson = await existing.json();
        const existingItem = existingJson?.data?.[0];

        if (existingItem) {
            if (existingItem.status === 'approved') {
                return new Response(
                    JSON.stringify({ message: "Dossier déjà validé. Contactez l'administration." }),
                    { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
                );
            }

            const updateRes = await fetch(
                `${baseUrl}/items/onboarding_drivers/${existingItem.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!updateRes.ok) {
                const errText = await updateRes.text();
                console.error("DIRECTUS UPDATE ERROR:", errText);
                throw new Error("Erreur mise à jour dossier");
            }
        } else {
            const createRes = await fetch(
                `${baseUrl}/items/onboarding_drivers`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!createRes.ok) {
                const errText = await createRes.text();
                console.error("DIRECTUS CREATE ERROR:", errText);
                throw new Error("Erreur création dossier");
            }
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Dossier enregistré' }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ message: error.message || 'Erreur serveur' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }
};
