import { z } from 'zod';

// Étape 1 : Identité & Infos Pro (Nouvelle définition)
export const identitySchema = z.object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    companyName: z.string().min(2, "Le nom de la société est requis"),
    vehicleCategory: z.enum(['Berline', 'Business', 'Van', 'VIP'], {
        errorMap: () => ({ message: "Sélectionnez une catégorie de véhicule" }),
    }),
    passengerCapacity: z.number().int().min(1, "Au moins 1 passager"),
    luggageCapacity: z.number().int().min(0, "Capacité bagages requise"),
});

// Étape 2 : Gestion des Réservations
export const reservationSchema = z.object({
    currentChannel: z.enum(['Appel', 'SMS', 'WhatsApp', 'Email', 'Autre'], {
        errorMap: () => ({ message: "Sélectionnez un canal principal" }),
    }),
    bookingLeadTime: z.enum(['H-2', 'H-24', '48h', '1 semaine'], {
        errorMap: () => ({ message: "Sélectionnez un délai minimum" }),
    }),
    criticalInfo: z.string().min(2, "Précisez les 3 infos indispensables"),
    validationMode: z.enum(['Manuelle', 'Automatique'], {
        errorMap: () => ({ message: "Sélectionnez le mode de validation" }),
    }),
});

// Étape 3 : Tarification & Paiement
export const pricingPaymentSchema = z.object({
    pricingModel: z.enum(['Forfait Horaire', 'Forfait Journée', 'Mixte'], {
        errorMap: () => ({ message: "Sélectionnez votre modèle de prix" }),
    }),
    extraFees: z.string().optional(),
    paymentTiming: z.enum(['100% commande', '30% acompte', 'Paiement à bord'], {
        errorMap: () => ({ message: "Sélectionnez le moment du paiement" }),
    }),
    invoiceNeeds: z.boolean().default(false),
});

// Étape 4 : Logistique & Relation Client
export const logisticsClientSchema = z.object({
    serviceArea: z.enum(['Paris Intramuros', 'Île-de-France', 'France Entière'], {
        errorMap: () => ({ message: "Sélectionnez votre zone" }),
    }),
    breakManagement: z.string().min(2, "Expliquez brièvement votre gestion des pauses"),
    multiStopPolicy: z.enum(['Inclus', 'Sur devis', 'Interdit'], {
        errorMap: () => ({ message: "Quelle est votre politique multi-stop ?" }),
    }),
    idealClientProfile: z.string().min(2, "Décrivez votre client idéal"),
    premiumServices: z.string().optional(),
    realTimeTracking: z.boolean().default(false),
    loyaltyAccount: z.boolean().default(false),
});

// Étape 5 : Imprévus & Admin -> On peut fusionner avec l'étape 4 dans l'affichage si besoin, ou garder 5 étapes
// Pour l'instant je l'ajoute comme partie du schéma global
export const adminSchema = z.object({
    cancellationPolicy: z.enum(['Annulation Flexible (24h)', 'Annulation Stricte (48h)', 'Non remboursable'], {
        errorMap: () => ({ message: "Sélectionnez votre politique d'annulation" }),
    }),
    latePolicy: z.boolean().default(false),
    subcontracting: z.boolean().default(false),
    painPoints: z.string().min(2, "Ce champ est important"),
});

// Schéma global combiné
export const onboardingSchema = identitySchema
    .merge(reservationSchema)
    .merge(pricingPaymentSchema)
    .merge(logisticsClientSchema)
    .merge(adminSchema);

export type OnboardingData = z.infer<typeof onboardingSchema>;
