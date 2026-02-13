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

        const fuseData = (main: string[], others?: string) => {
            const base = (main || []).filter(i => i !== "Autres");
            const extra = others
                ? others.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            return [...base, ...extra];
        };

        const payload = {
            status: "pending",

            prenom: d.firstName,
            nom: d.lastName,
            email: d.email,
            nom_entreprise: d.companyName,

            categorie_vehicule: d.vehicleCategory,
            capacite_passagers: d.passengerCapacity,
            capacite_bagages: d.luggageCapacity,

            canal_reservation: d.currentChannel,
            delai_prevenance: d.bookingLeadTime,

            infos_critiques: fuseData(d.criticalInfo, d.otherCriticalInfo).join(', '),
            langues: fuseData(d.langues, d.otherLanguage),
            options_bord: fuseData(d.premiumServices, d.otherService),

            mode_validation: d.validationMode,
            modele_prix: d.pricingModel,

            tarif_4h: d.tarif_4h,
            tarif_8h: d.tarif_8h,
            km_inclus: d.km_inclus,
            prix_km_supp: d.prix_km_supp,

            frais_supp: d.extraFees || null,
            acompte_percent: d.acompte_percent,
            moment_paiement: d.paymentTiming,

            besoin_facturation: d.invoiceNeeds ?? false,

            zone_intervention: d.serviceArea,
            interet_tourisme: d.interet_tourisme,
            tarifs_fixes_aeroport: d.tarifs_fixes_aeroport ?? false,

            gestion_pauses: d.breakManagement,
            politique_multi_stop: d.multiStopPolicy,
            profil_client_ideal: d.idealClientProfile,

            politique_annulation: d.cancellationPolicy,
            retard_facture: d.latePolicy ?? false,
            sous_traitance: d.subcontracting ?? false,

            point_noir_admin: d.painPoints,
            suivi_temps_reel: d.realTimeTracking ?? false,
            compte_fidelite: d.loyaltyAccount ?? false
        };

        const baseUrl = import.meta.env.DIRECTUS_URL;
        const token = import.meta.env.DIRECTUS_TOKEN;

        // 🔎 1️⃣ Vérifier si email existe déjà
        const existing = await fetch(
            `${baseUrl}/items/onboarding_drivers?filter[email][_eq]=${d.email}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const existingJson = await existing.json();
        const existingItem = existingJson?.data?.[0];

        if (existingItem) {
            // 🔄 UPDATE
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
                const errorText = await updateRes.text();
                throw new Error(`Directus update error: ${errorText}`);
            }

        } else {
            // ➕ CREATE
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
                const errorText = await createRes.text();
                throw new Error(`Directus create error: ${errorText}`);
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
