export const prerender = false;

import type { APIRoute } from 'astro';
import { onboardingSchema } from '../../lib/schema';

export const ALL: APIRoute = async ({ request }) => {
    // Configuration CORS
    const corsHeaders = {
        // ⚠️ SÉCURITÉ : En prod, remplace '*' par ton domaine exact
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // 1. Gestion du Preflight OPTIONS (CORS)
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    // 2. Vérification stricte du POST
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ message: `Method ${request.method} not allowed` }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

    try {
        console.log("--> API SUBMIT: Requête reçue");
        const textData = await request.text();
        console.log("--> RAW BODY:", textData);

        const data = textData ? JSON.parse(textData) : {};

        // Test Parsing
        // console.log("--> Données reçues:", JSON.stringify(data).substring(0, 50) + "...");

        const parsedData = onboardingSchema.safeParse(data);

        if (!parsedData.success) {
            console.error("--> Validation échouée", parsedData.error.errors);
            return new Response(JSON.stringify({
                message: 'Données invalides',
                errors: parsedData.error.errors
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        const d = parsedData.data;

        // Fonction de fusion
        const fuseData = (main: string[], others: string | undefined) => {
            const base = (main || []).filter(item => item !== "Autres");
            const extra = others ? others.split(',').map(s => s.trim()).filter(s => s !== "") : [];
            return [...base, ...extra].join(', ');
        };

        const payload = {
            status: "draft",
            prenom: d.firstName,
            nom: d.lastName,
            email: d.email,
            nom_entreprise: d.companyName,
            categorie_vehicule: d.vehicleCategory,
            capacite_passagers: d.passengerCapacity,
            capacite_bagages: d.luggageCapacity,
            canal_reservation: d.currentChannel,
            delai_prevenance: d.bookingLeadTime,

            infos_critiques: fuseData(d.criticalInfo, d.otherCriticalInfo || ""),
            langues: fuseData(d.langues, d.otherLanguage || ""),
            options_bord: fuseData(d.premiumServices, d.otherService || ""),

            mode_validation: d.validationMode,
            modele_prix: d.pricingModel,
            tarif_4h: d.tarif_4h,
            tarif_8h: d.tarif_8h,
            km_inclus: d.km_inclus,
            prix_km_supp: d.prix_km_supp,
            frais_supp: d.extraFees || "", // Fallback
            acompte_percent: d.acompte_percent,
            moment_paiement: d.paymentTiming,
            besoin_facturation: d.invoiceNeeds || false, // Sécurité boolean
            zone_intervention: d.serviceArea,
            interet_tourisme: d.interet_tourisme,
            tarifs_fixes_aeroport: d.tarifs_fixes_aeroport || false,
            gestion_pauses: d.breakManagement || "",
            politique_multi_stop: d.multiStopPolicy,
            profil_client_ideal: d.idealClientProfile || "",
            politique_annulation: d.cancellationPolicy,
            retard_facture: d.latePolicy || false,
            sous_traitance: d.subcontracting || false,
            point_noir_admin: d.painPoints,
            suivi_temps_reel: d.realTimeTracking || false,
            compte_fidelite: d.loyaltyAccount || false
        };

        console.log("--> Envoi vers n8n...", JSON.stringify(payload).substring(0, 50) + "...");

        const n8nResponse = await fetch('https://n8n.remyparis.com/webhook/onboarding-vtc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("--> Réponse n8n status:", n8nResponse.status);

        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            console.error("Erreur n8n brute:", errorText);
            throw new Error(`Erreur n8n (${n8nResponse.status}): ${errorText.substring(0, 200)}`);
        }

        console.log("--> SUCCÈS FINI");
        return new Response(JSON.stringify({ success: true, message: 'Dossier reçu' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

    } catch (error: any) {
        console.error("--> CATCH ERROR:", error);
        return new Response(JSON.stringify({ message: error.message || 'Erreur inconnue' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
};