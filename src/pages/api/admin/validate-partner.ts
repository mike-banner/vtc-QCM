// /home/mike/projects/vtc/vtc-questions/src/pages/api/admin/validate-partner.ts

export const prerender = false;

import type { APIRoute } from 'astro';
import { DirectusClient } from '../../../lib/directus';

export const POST: APIRoute = async ({ request }) => {

    // 🔐 Réactiver en prod
    /*
    if (!isAuthenticated(cookies)) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 });
    }
    */

    try {
        const body = await request.json();
        const { id, status, point_noir_admin } = body;

        if (!id || !status) {
            return new Response(
                JSON.stringify({ error: 'ID et statut requis' }),
                { status: 400 }
            );
        }

        const directus = new DirectusClient();
        const onboarding = await directus.getOnboardingById(id);

        if (!onboarding) {
            return new Response(
                JSON.stringify({ error: 'Onboarding introuvable' }),
                { status: 404 }
            );
        }

        if (onboarding.status !== 'pending') {
            return new Response(
                JSON.stringify({ error: 'Ce dossier a déjà été traité.' }),
                { status: 400 }
            );
        }

        if (status === 'approved') {

            // =========================
            // 1️⃣ COMPANY
            // =========================

            let company = await directus.getCompanyByEmail(onboarding.email);

            if (!company) {
                company = await directus.createCompany({
                    legal_name:
                        onboarding.company_name ||
                        `${onboarding.first_name} ${onboarding.last_name}`,
                    email: onboarding.email,
                    phone: onboarding.phone,
                    account_type:
                        onboarding.account_type === 'Société' ? 'team' : 'solo',
                    is_active: true
                });
            }

            // =========================
            // 2️⃣ DRIVER
            // =========================

            let driver = await directus.getDriverByEmail(onboarding.email);

            if (!driver) {
                driver = await directus.createDriver({
                    company_id: company.id,
                    first_name: onboarding.first_name,
                    last_name: onboarding.last_name,
                    phone: onboarding.phone,
                    email: onboarding.email,
                    professional_license_number:
                        onboarding.professional_license_number,
                    status: 'active',
                    is_available: true
                });
            }

            // =========================
            // 3️⃣ VEHICLE
            // =========================

            let vehicle = await directus.getVehicleByDriverId(driver.id);

            if (!vehicle) {
                vehicle = await directus.createVehicle({
                    company_id: company.id,
                    driver_id: driver.id,
                    category: onboarding.vehicle_category,
                    model: onboarding.vehicle_model,
                    immatriculation: onboarding.immatriculation,
                    passenger_capacity: onboarding.passenger_capacity,
                    luggage_capacity: onboarding.luggage_capacity,
                    is_active: true
                });
            }

            // =========================
            // 4️⃣ VEHICLE SETTINGS
            // =========================

            let settings =
                await directus.getVehicleSettingsByVehicleId(vehicle.id);

            if (!settings) {
                await directus.createVehicleSettings({
                    vehicle_id: vehicle.id,
                    rate_4h: onboarding.rate_4h,
                    rate_8h:
                        onboarding.rate_8h ??
                        (onboarding.rate_4h
                            ? onboarding.rate_4h * 2
                            : 0),
                    included_km: onboarding.included_km ?? 0,
                    extra_km_price: onboarding.extra_km_price ?? 0,
                    deposit_percent: onboarding.deposit_percent ?? 30,
                    pricing_model: onboarding.pricing_model,
                    payment_timing: onboarding.payment_timing,
                    service_area: onboarding.service_area
                });
            }

            // =========================
            // 5️⃣ UPDATE STATUS
            // =========================

            await directus.updatePartnerStatus(id, {
                status: 'approved',
                point_noir_admin
            });
        }

        if (status === 'rejected') {
            await directus.updatePartnerStatus(id, {
                status: 'rejected',
                point_noir_admin
            });
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Partenaire ${status}`
            }),
            { status: 200 }
        );

    } catch (error: any) {
        console.error('VALIDATION ERROR:', error);

        return new Response(
            JSON.stringify({
                error: 'Erreur validation',
                details: error.message
            }),
            { status: 500 }
        );
    }
};
