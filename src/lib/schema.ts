import { z } from 'zod';

// Étape 1 : Identité & Infos Pro
export const identitySchema = z.object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    companyName: z.string().min(2, "Le nom de la société est requis"),
    vehicleCategory: z.enum(['Berline', 'Business', 'Van', 'VIP'], {
        errorMap: () => ({ message: "Sélectionnez une catégorie de véhicule" }),
    }),
    passengerCapacity: z.preprocess((v) => Number(v) || 0, z.number().int().min(1, "Au moins 1 passager")),
    luggageCapacity: z.preprocess((v) => Number(v) || 0, z.number().int().min(0, "Capacité bagages requise")),
});

// Étape 2 : Gestion des Réservations
export const reservationSchema = z.object({
    currentChannel: z.enum(['Appel', 'SMS', 'WhatsApp', 'Email', 'Autre'], {
        errorMap: () => ({ message: "Sélectionnez un canal principal" }),
    }),
    bookingLeadTime: z.enum(['H-2', 'H-24', '48h', '1 semaine'], {
        errorMap: () => ({ message: "Sélectionnez un délai minimum" }),
    }),
    criticalInfo: z.array(z.string()).min(1, "Sélectionnez au moins un critère"),
    otherCriticalInfo: z.string().optional().default(""), // Corrigé pour les tags
    validationMode: z.enum(['Manuelle', 'Automatique'], {
        errorMap: () => ({ message: "Sélectionnez le mode de validation" }),
    }),
});

// Étape 4 : Logistique & Relation Client
export const logisticsClientSchema = z.object({
    serviceArea: z.enum(['Paris Intramuros', 'Île-de-France', 'France Entière'], {
        errorMap: () => ({ message: "Sélectionnez votre zone" }),
    }),
    langues: z.array(z.string()).min(1, "Sélectionnez au moins une langue"),
    otherLanguage: z.string().optional().default(""), // Corrigé pour les tags
    interet_tourisme: z.preprocess((v) => Number(v) || 0, z.number().min(0).max(5).default(0)),
    tarifs_fixes_aeroport: z.boolean().default(false),
    breakManagement: z.string().min(2, "Expliquez brièvement votre gestion des pauses"),
    multiStopPolicy: z.enum(['Inclus', 'Sur devis', 'Interdit'], {
        errorMap: () => ({ message: "Quelle est votre politique multi-stop ?" }),
    }),
    idealClientProfile: z.string().min(2, "Décrivez votre client idéal"),
    premiumServices: z.array(z.string()).default([]),
    otherService: z.string().optional().default(""), // Corrigé pour les tags
    realTimeTracking: z.boolean().default(false),
    loyaltyAccount: z.boolean().default(false),
});

// Les autres schémas (pricingPaymentSchema, adminSchema) restent identiques...
export const pricingPaymentSchema = z.object({
    pricingModel: z.enum(['Forfait Horaire', 'Forfait Journée', 'Mixte']),
    tarif_4h: z.preprocess((v) => Number(v) || 0, z.number().min(0)),
    tarif_8h: z.preprocess((v) => Number(v) || 0, z.number().min(0)),
    km_inclus: z.preprocess((v) => Number(v) || 0, z.number().min(0)),
    prix_km_supp: z.preprocess((v) => Number(v) || 0, z.number().min(0)),
    acompte_percent: z.preprocess((v) => Number(v) || 0, z.number().min(0).max(100)),
    extraFees: z.string().optional(),
    paymentTiming: z.enum(['100% commande', '30% acompte', 'Paiement à bord']),
    invoiceNeeds: z.boolean().default(false),
});

export const adminSchema = z.object({
    cancellationPolicy: z.enum(['Annulation Flexible (24h)', 'Annulation Stricte (48h)', 'Non remboursable']),
    latePolicy: z.boolean().default(false),
    subcontracting: z.boolean().default(false),
    painPoints: z.string().min(2),
});

export const onboardingSchema = identitySchema
    .merge(reservationSchema)
    .merge(pricingPaymentSchema)
    .merge(logisticsClientSchema)
    .merge(adminSchema);

export type OnboardingData = z.infer<typeof onboardingSchema>;