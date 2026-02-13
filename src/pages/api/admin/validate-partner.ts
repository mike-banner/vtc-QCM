// /home/mike/projects/vtc/vtc-questions/src/pages/api/admin/validate-partner.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { DirectusClient } from '../../../lib/directus';
import { isAuthenticated } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
    // Vérifier l'authentification
    if (!isAuthenticated(cookies)) {
        return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, status, point_noir_admin, account_type, hub_id } = body;

        if (!id || !status) {
            return new Response(JSON.stringify({ error: 'ID et statut requis' }), { status: 400 });
        }

        const directus = new DirectusClient();

        // 1. Si approuvé, on crée l'entreprise (STEP 3)
        if (status === 'approved') {
            const driverData = await directus.getOnboardingById(id);
            if (!driverData) {
                console.error(`[VALIDATION] Chauffeur ${id} non trouvé`);
                return new Response(JSON.stringify({ error: 'Chauffeur non trouvé' }), { status: 404 });
            }

            console.log("=== [STEP 3] CREATING ENTREPRISE ===");

            const entreprise = await directus.createEntreprise({
                nom_legal: driverData.nom_entreprise || `${driverData.prenom} ${driverData.nom}`,
                telephone: driverData.telephone,
                account_type: account_type === 'team' ? 'driver' : 'solo',
                is_active: true
            });

            console.log("Entreprise créée avec succès, ID:", entreprise.id);

            console.log("=== [STEP 4] CREATING DRIVER ===");
            const createdDriver = await directus.createDriver({
                entreprise_id: entreprise.id,
                prenom: driverData.prenom,
                nom: driverData.nom,
                telephone: driverData.telephone,
                email: driverData.email,
                carte_pro_num: driverData.carte_pro_num,
                status: "active",
                is_available: true
            });

            console.log("Chauffeur créé avec succès, ID:", createdDriver.id);

            console.log("=== [STEP 5] CREATING VEHICLE ===");
            const createdVehicle = await directus.createVehicle({
                entreprise_id: entreprise.id,
                driver_id: createdDriver.id,
                categorie: driverData.categorie_vehicule,
                capacite_passagers: driverData.capacite_passagers,
                capacite_bagages: driverData.capacite_bagages,
                immatriculation: driverData.immatriculation
            });

            console.log("Véhicule créé avec succès, ID:", createdVehicle.id);

            console.log("=== [STEP 6] CREATING VEHICLE SETTINGS ===");
            const createdSettings = await directus.createVehicleSettings({
                vehicle_id: createdVehicle.id,
                tarif_4h: driverData.tarif_4h,
                tarif_8h: driverData.tarif_8h,
                km_inclus: driverData.km_inclus,
                prix_km_supp: driverData.prix_km_supp,
                zone_intervention: driverData.zone_intervention,
                langues: driverData.langues,
                options_bord: driverData.options_bord,
                acompte_percent: driverData.acompte_percent,
                modele_prix: driverData.modele_prix,
                moment_paiement: driverData.moment_paiement,
                gestion_pauses: driverData.gestion_pauses,
                politique_multi_stop: driverData.politique_multi_stop,
                profil_client_ideal: driverData.profil_client_ideal,
                suivi_temps_reel: driverData.suivi_temps_reel,
                compte_fidelite: driverData.compte_fidelite
            });

            console.log("Vehicle Settings créés avec succès, ID:", createdSettings.id);
            console.log("==========================================");
        }

        // 2. Mise à jour du statut final de l'onboarding
        // Si on est arrivé ici sans erreur (soit création OK, soit pas approbation), on valide le statut
        const success = await directus.updatePartnerStatus(id, {
            status,
            point_noir_admin
        });

        if (success) {
            console.log(`[VALIDATION] Succès final pour le partenaire ${id} (Status: ${status})`);
            return new Response(JSON.stringify({
                success: true,
                message: `Le partenaire a été ${status === 'approved' ? 'approuvé et créé' : 'mis à jour'} avec succès.`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            console.error(`[VALIDATION] Échec de la mise à jour du statut final pour ${id}`);
            return new Response(JSON.stringify({ error: 'Échec de la mise à jour du statut Directus' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error: any) {
        console.error('*** [VALIDATION ERROR] ***');
        console.error('Message:', error.message);
        if (error.stack) console.error('Stack:', error.stack);
        console.error('***************************');

        return new Response(JSON.stringify({
            error: 'Erreur lors du processus de validation',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
