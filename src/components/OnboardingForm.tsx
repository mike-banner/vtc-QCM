import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft, Check, User, Car, DollarSign, MapPin, Target } from 'lucide-react';
import { onboardingSchema, type OnboardingData } from '../lib/schema';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility pour le styling Tailwind
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, title: 'Identité & Véhicule', icon: User },
    { id: 2, title: 'Réservations', icon: Car },
    { id: 3, title: 'Tarifs & Paiement', icon: DollarSign },
    { id: 4, title: 'Logistique & Client', icon: MapPin },
    { id: 5, title: 'Imprévus & Admin', icon: Target },
];

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [direction, setDirection] = useState(1);

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm<OnboardingData>({
        resolver: zodResolver(onboardingSchema),
        mode: 'onChange',
    });

    const nextStep = async () => {
        let fieldsToValidate: (keyof OnboardingData)[] = [];

        // Mapping des validations par étape (Source de vérité: schema.ts)
        switch (currentStep) {
            case 1:
                fieldsToValidate = ['firstName', 'lastName', 'email', 'companyName', 'vehicleCategory', 'passengerCapacity', 'luggageCapacity'];
                break;
            case 2:
                fieldsToValidate = ['currentChannel', 'bookingLeadTime', 'criticalInfo', 'validationMode'];
                break;
            case 3:
                fieldsToValidate = ['pricingModel', 'paymentTiming'];
                break;
            case 4:
                fieldsToValidate = ['serviceArea', 'breakManagement', 'multiStopPolicy', 'idealClientProfile'];
                break;
            case 5:
                fieldsToValidate = ['cancellationPolicy', 'painPoints'];
                break;
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data: OnboardingData) => {
        setIsSubmitting(true);
        try {
            // TRANSFORMATION : On traduit le Frontend (CamelCase) vers ton Directus (Snake_case)
            const payload = {
                status: "draft",
                prenom: data.firstName,
                nom: data.lastName,
                email: data.email,
                nom_entreprise: data.companyName,
                categorie_vehicule: data.vehicleCategory,
                capacite_passagers: data.passengerCapacity,
                capacite_bagages: data.luggageCapacity,
                zone_intervention: data.serviceArea,
                besoin_facturation: data.invoiceNeeds,
                point_noir_admin: data.painPoints,
                // On peut ajouter les autres si ton n8n les attend :
                options_bord: data.premiumServices,
                delai_prevenance: data.bookingLeadTime
            };

            const response = await fetch('https://n8n.remyparis.com/webhook-test/onboarding-vtc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Erreur de transmission vers n8n');

            alert('Dossier envoyé avec succès !');
        } catch (error) {
            console.error(error);
            alert('Une erreur est survenue lors de l\'envoi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-white" })}
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
                            {steps[currentStep - 1].title}
                        </h2>
                    </div>
                    <span className="text-sm font-medium text-slate-500">
                        {currentStep} / {steps.length}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-slate-900 rounded-full"
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 min-h-[450px] flex flex-col justify-between">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="space-y-6 flex-grow"
                    >
                        {/* ETAPE 1 */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Prénom" name="firstName" register={register} error={errors.firstName} />
                                <InputField label="Nom" name="lastName" register={register} error={errors.lastName} />
                                <InputField label="Email Pro" name="email" type="email" register={register} error={errors.email} className="md:col-span-2" />
                                <InputField label="Nom de la Société" name="companyName" register={register} error={errors.companyName} className="md:col-span-2" />
                                <SelectField label="Catégorie Véhicule" name="vehicleCategory" register={register} error={errors.vehicleCategory} options={['Berline', 'Business', 'Van', 'VIP']} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Passagers" name="passengerCapacity" type="number" register={register} error={errors.passengerCapacity} />
                                    <InputField label="Valises" name="luggageCapacity" type="number" register={register} error={errors.luggageCapacity} />
                                </div>
                            </div>
                        )}

                        {/* ETAPE 2 */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <SelectField label="Canal de réservation principal" name="currentChannel" register={register} error={errors.currentChannel} options={['Appel', 'SMS', 'WhatsApp', 'Email', 'Autre']} />
                                <SelectField label="Délai minimum (Anticipation)" name="bookingLeadTime" register={register} error={errors.bookingLeadTime} options={['H-2', 'H-24', '48h', '1 semaine']} />
                                <InputField label="3 infos clés pour valider" name="criticalInfo" register={register} error={errors.criticalInfo} placeholder="ex: Lieu, Date, Type de vol" />
                                <SelectField label="Mode de validation" name="validationMode" register={register} error={errors.validationMode} options={['Manuelle', 'Automatique']} />
                            </div>
                        )}

                        {/* ETAPE 3 */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <SelectField label="Modèle de prix" name="pricingModel" register={register} error={errors.pricingModel} options={['Forfait Horaire', 'Forfait Journée', 'Mixte']} />
                                <InputField label="Frais supplémentaires (Parking...)" name="extraFees" register={register} error={errors.extraFees} />
                                <SelectField label="Moment du paiement" name="paymentTiming" register={register} error={errors.paymentTiming} options={['100% commande', '30% acompte', 'Paiement à bord']} />
                                <CheckboxField label="Besoin de facture PDF avec TVA ?" name="invoiceNeeds" register={register} />
                            </div>
                        )}

                        {/* ETAPE 4 */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <SelectField label="Zone d'intervention" name="serviceArea" register={register} error={errors.serviceArea} options={['Paris Intramuros', 'Île-de-France', 'France Entière']} />
                                <InputField label="Gestion des pauses ?" name="breakManagement" register={register} error={errors.breakManagement} isTextArea />
                                <SelectField label="Politique Multi-Stop" name="multiStopPolicy" register={register} error={errors.multiStopPolicy} options={['Inclus', 'Sur devis', 'Interdit']} />
                                <InputField label="Votre client idéal ?" name="idealClientProfile" register={register} error={errors.idealClientProfile} isTextArea />
                            </div>
                        )}

                        {/* ETAPE 5 */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <SelectField label="Politique d'annulation" name="cancellationPolicy" register={register} error={errors.cancellationPolicy} options={['Annulation Flexible (24h)', 'Annulation Stricte (48h)', 'Non remboursable']} />
                                <CheckboxField label="Retard client facturé (après 30min) ?" name="latePolicy" register={register} />
                                <CheckboxField label="Droit de sous-traiter ?" name="subcontracting" register={register} />
                                <InputField label="Le point bloquant dans ton orga ?" name="painPoints" register={register} error={errors.painPoints} isTextArea placeholder="Détaillez vos difficultés administratives..." />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 mt-6 border-t border-slate-100">
                    <button type="button" onClick={prevStep} disabled={currentStep === 1} className={cn("flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors", currentStep === 1 && "invisible")}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                    </button>

                    {currentStep < steps.length ? (
                        <button type="button" onClick={nextStep} className="flex items-center px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                            Suivant <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <button type="submit" disabled={isSubmitting} className="flex items-center px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/10">
                            {isSubmitting ? 'Envoi...' : 'Valider mon dossier'} {!isSubmitting && <Check className="w-4 h-4 ml-2" />}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

// COMPOSANTS ATOMIQUES INTERNES
const InputField = ({ label, name, register, error, type = "text", className, isTextArea = false, placeholder }: any) => (
    <div className={cn("flex flex-col space-y-1.5", className)}>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {isTextArea ? (
            <textarea {...register(name)} className={cn("px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all min-h-[100px]", error && "border-red-500")} placeholder={placeholder} />
        ) : (
            <input {...register(name, { valueAsNumber: type === 'number' })} type={type} className={cn("px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all", error && "border-red-500")} placeholder={placeholder} />
        )}
        {error && <span className="text-xs text-red-500 mt-1 font-medium">{error.message}</span>}
    </div>
);

const SelectField = ({ label, name, register, error, options }: any) => (
    <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <select {...register(name)} className={cn("px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all appearance-none cursor-pointer", error && "border-red-500")}>
            <option value="">Sélectionner...</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {error && <span className="text-xs text-red-500 mt-1 font-medium">{error.message}</span>}
    </div>
);

const CheckboxField = ({ label, name, register }: any) => (
    <label className="flex items-center space-x-3 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
        <input type="checkbox" {...register(name)} className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
        <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
);