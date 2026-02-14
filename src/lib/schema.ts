// /home/mike/projects/vtc/vtc-questions/src/lib/schema.ts

import { z } from 'zod';

/**
 * Onboarding Schema V1 (Frontend Keys: camelCase)
 */
export const onboardingSchema = z.object({
    // Driver
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phonePrefix: z.string().default("+33"),
    phone: z.string().min(8, "Numéro trop court"),
    professionalLicenseNumber: z.string().min(3, "N° carte pro requis"),

    // Company
    companyName: z.string().min(2, "Le nom de la société est requis"),
    accountType: z.enum(['Auto-entrepreneur', 'Société'], {
        errorMap: () => ({ message: "Sélectionnez un type de compte" }),
    }),

    // Vehicle
    vehicleCategory: z.enum(['Berline', 'Business', 'Van', 'VIP'], {
        errorMap: () => ({ message: "Sélectionnez une catégorie" }),
    }),
    vehicleModel: z.string().min(2, "Modèle requis"),
    immatriculation: z.string().min(5, "Immatriculation requise"),
    passengerCapacity: z.preprocess(
        (v) => Number(v),
        z.number().int().min(1, "Min. 1")
    ),
    luggageCapacity: z.preprocess(
        (v) => Number(v),
        z.number().int().min(0, "Min. 0")
    ),

    // Pricing (camelCase côté frontend)
    pricingModel: z.enum(['Forfait Horaire', 'Forfait Journée', 'Mixte'], {
        errorMap: () => ({ message: "Sélectionnez un modèle de prix" }),
    }),

    rate4h: z.preprocess(
        (v) => (v === "" || v === undefined || v === null ? 0 : Number(v)),
        z.number().min(0)
    ),

    rate8h: z.preprocess(
        (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
        z.number().min(0).optional()
    ),

    includedKm: z.preprocess(
        (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
        z.number().min(0).optional()
    ),

    extraKmPrice: z.preprocess(
        (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
        z.number().min(0).optional()
    ),

    depositPercent: z.preprocess(
        (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
        z.number().min(0).max(100).optional()
    ),


    paymentTiming: z.enum(['100% commande', '30% acompte', 'Paiement à bord'], {
        errorMap: () => ({ message: "Sélectionnez le moment du paiement" }),
    }),

    serviceArea: z.enum(['Paris Intramuros', 'Île-de-France', 'France Entière'], {
        errorMap: () => ({ message: "Sélectionnez votre zone" }),
    }),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
