import React, { useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Car, DollarSign, MapPin, Target, X, CheckCircle, AlertCircle } from 'lucide-react';
import { onboardingSchema, type OnboardingData } from '../lib/schema';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);

    // États pour stocker les badges créés
    const [tagInputs, setTagInputs] = useState({
        critical: [] as string[],
        languages: [] as string[],
        services: [] as string[]
    });

    // États INDIVIDUELS pour le texte en cours de saisie
    const [tagTexts, setTagTexts] = useState({
        critical: "",
        languages: "",
        services: ""
    });

    const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<OnboardingData>({
        resolver: zodResolver(onboardingSchema),
        mode: 'onChange',
        defaultValues: { langues: [], premiumServices: [], criticalInfo: [] }
    });

    const watchCriticals = watch("criticalInfo") || [];
    const watchLangues = watch("langues") || [];
    const watchServices = watch("premiumServices") || [];

    const handleTagAdd = (e: KeyboardEvent<HTMLInputElement>, category: keyof typeof tagInputs, fieldName: any) => {
        const currentText = tagTexts[category];

        if ((e.key === 'Enter' || e.key === ',') && currentText.trim()) {
            e.preventDefault();
            const val = currentText.trim().replace(/,$/, '');
            if (!tagInputs[category].includes(val)) {
                const newTags = [...tagInputs[category], val];
                setTagInputs(prev => ({ ...prev, [category]: newTags }));
                setValue(fieldName, newTags.join(', '));
            }
            // On vide seulement le texte de CETTE catégorie
            setTagTexts(prev => ({ ...prev, [category]: "" }));
        }
    };

    const removeTag = (index: number, category: keyof typeof tagInputs, fieldName: any) => {
        const newTags = tagInputs[category].filter((_, i) => i !== index);
        setTagInputs(prev => ({ ...prev, [category]: newTags }));
        setValue(fieldName, newTags.join(', '));
    };

    const nextStep = async () => {
        let fields: (keyof OnboardingData)[] = [];
        switch (currentStep) {
            case 1: fields = ['firstName', 'lastName', 'email', 'companyName', 'vehicleCategory', 'passengerCapacity', 'luggageCapacity']; break;
            case 2: fields = ['currentChannel', 'bookingLeadTime', 'criticalInfo', 'otherCriticalInfo', 'validationMode']; break;
            case 3: fields = ['pricingModel', 'tarif_4h', 'tarif_8h', 'km_inclus', 'prix_km_supp', 'acompte_percent', 'paymentTiming']; break;
            case 4: fields = ['serviceArea', 'langues', 'otherLanguage', 'interet_tourisme', 'tarifs_fixes_aeroport', 'breakManagement', 'multiStopPolicy', 'premiumServices', 'otherService', 'idealClientProfile', 'realTimeTracking', 'loyaltyAccount']; break;
            case 5: fields = ['cancellationPolicy', 'painPoints']; break;
        }
        if (await trigger(fields)) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
            setErrorMessage(null); // Clear error on step change
        } else {
            setErrorMessage("Veuillez remplir correctement tous les champs obligatoires avant de continuer.");
        }
    };

    const onSubmit = async (data: OnboardingData) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error("Non-JSON response:", responseText);
                throw new Error(`Erreur serveur (Format invalide): ${responseText.substring(0, 50)}...`);
            }

            if (!response.ok) {
                throw new Error(responseData.message || `Erreur ${response.status}: ${responseData.error || 'Inconnue'}`);
            }

            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || "Une erreur est survenue lors de l'envoi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Candidature transmise !</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    Nous avons bien reçu votre dossier. Vous pouvez encore modifier vos réponses si vous avez oublié un détail.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Rectifier ma réponse
                    </button>
                    {/* Optionnel : Bouton pour recharger/finir */}
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-white" })}
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800">{steps[currentStep - 1].title}</h2>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{currentStep} / 5</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full">
                    <motion.div className="h-full bg-slate-900 rounded-full" animate={{ width: `${(currentStep / 5) * 100}%` }} />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 min-h-[500px] flex flex-col justify-between">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div key={currentStep} initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction < 0 ? 30 : -30, opacity: 0 }} className="space-y-6">

                        {/* STEP 1 */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Prénom" name="firstName" register={register} error={errors.firstName} />
                                <InputField label="Nom" name="lastName" register={register} error={errors.lastName} />
                                <InputField label="Email Pro" name="email" type="email" register={register} error={errors.email} className="md:col-span-2" />
                                <InputField label="Société" name="companyName" register={register} error={errors.companyName} className="md:col-span-2" />
                                <SelectField label="Véhicule" name="vehicleCategory" register={register} options={['Berline', 'Business', 'Van', 'VIP']} error={errors.vehicleCategory} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Passagers" name="passengerCapacity" type="number" register={register} error={errors.passengerCapacity} />
                                    <InputField label="Valises" name="luggageCapacity" type="number" register={register} error={errors.luggageCapacity} />
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <SelectField label="Canal principal" name="currentChannel" register={register} options={['Appel', 'SMS', 'WhatsApp', 'Email', 'Autre']} error={errors.currentChannel} />
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700">Checklist Validation</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Lieu de charge', 'Destination', 'Nom Passager', 'Vol/Train', 'Autres'].map(i => (
                                            <CheckboxField key={i} label={i} value={i} name="criticalInfo" register={register} />
                                        ))}
                                    </div>
                                    {errors.criticalInfo && <span className="text-xs text-red-500">{errors.criticalInfo.message}</span>}
                                    {watchCriticals.includes("Autres") && (
                                        <TagInput
                                            tags={tagInputs.critical}
                                            value={tagTexts.critical}
                                            onChange={(val: string) => setTagTexts(prev => ({ ...prev, critical: val }))}
                                            onKeyDown={(e: any) => handleTagAdd(e, 'critical', 'otherCriticalInfo')}
                                            onRemove={(i: number) => removeTag(i, 'critical', 'otherCriticalInfo')}
                                            placeholder="Ex: Siège bébé, Pancarte (Entrée)"
                                        />
                                    )}
                                </div>
                                <SelectField label="Délai Prévenance" name="bookingLeadTime" register={register} options={['H-2', 'H-24', '48h', '1 semaine']} error={errors.bookingLeadTime} />
                                <SelectField label="Mode Validation" name="validationMode" register={register} options={['Manuelle', 'Automatique']} error={errors.validationMode} />
                            </div>
                        )}

                        {/* STEP 3 */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <SelectField label="Modèle de prix" name="pricingModel" register={register} options={['Forfait Horaire', 'Forfait Journée', 'Mixte']} error={errors.pricingModel} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Tarif 4h (€)" name="tarif_4h" type="number" register={register} error={errors.tarif_4h} />
                                    <InputField label="Tarif 8h (€)" name="tarif_8h" type="number" register={register} error={errors.tarif_8h} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="KM inclus" name="km_inclus" type="number" register={register} error={errors.km_inclus} />
                                    <InputField label="Prix KM supp (€)" name="prix_km_supp" type="number" register={register} step="0.1" error={errors.prix_km_supp} />
                                </div>
                                <InputField label="Acompte (%)" name="acompte_percent" type="number" register={register} error={errors.acompte_percent} />
                                <SelectField label="Paiement" name="paymentTiming" register={register} options={['100% commande', '30% acompte', 'Paiement à bord']} error={errors.paymentTiming} />
                            </div>
                        )}

                        {/* STEP 4 */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <SelectField label="Zone" name="serviceArea" register={register} options={['Paris Intramuros', 'Île-de-France', 'France Entière']} error={errors.serviceArea} />
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700">Langues</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Français', 'Anglais', 'Espagnol', 'Autres'].map(l => (
                                            <CheckboxField key={l} label={l} value={l} name="langues" register={register} />
                                        ))}
                                    </div>
                                    {errors.langues && <span className="text-xs text-red-500">{errors.langues.message}</span>}
                                    {watchLangues.includes("Autres") && (
                                        <TagInput
                                            tags={tagInputs.languages}
                                            value={tagTexts.languages}
                                            onChange={(val: string) => setTagTexts(prev => ({ ...prev, languages: val }))}
                                            onKeyDown={(e: any) => handleTagAdd(e, 'languages', 'otherLanguage')}
                                            onRemove={(i: number) => removeTag(i, 'languages', 'otherLanguage')}
                                            placeholder="Ajouter une langue..."
                                        />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700">Services</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Eau', 'Wifi', 'Presse', 'Autres'].map(s => (
                                            <CheckboxField key={s} label={s} value={s} name="premiumServices" register={register} />
                                        ))}
                                    </div>
                                    {watchServices.includes("Autres") && (
                                        <TagInput
                                            tags={tagInputs.services}
                                            value={tagTexts.services}
                                            onChange={(val: string) => setTagTexts(prev => ({ ...prev, services: val }))}
                                            onKeyDown={(e: any) => handleTagAdd(e, 'services', 'otherService')}
                                            onRemove={(i: number) => removeTag(i, 'services', 'otherService')}
                                            placeholder="Précisez..."
                                        />
                                    )}
                                </div>

                                <InputField label="Note intérêt touristique (0 à 5)" name="interet_tourisme" type="number" register={register} error={errors.interet_tourisme} />
                                <CheckboxField label="Tarifs fixes Aéroport ?" name="tarifs_fixes_aeroport" register={register} />
                                <InputField label="Gestion des pauses" name="breakManagement" register={register} isTextArea error={errors.breakManagement} />
                                <SelectField label="Politique arrêts multiples" name="multiStopPolicy" register={register} options={['Inclus', 'Sur devis', 'Interdit']} error={errors.multiStopPolicy} />
                                <CheckboxField label="Suivi temps réel" name="realTimeTracking" register={register} />
                                <CheckboxField label="Compte fidélité" name="loyaltyAccount" register={register} />
                                <InputField label="Client idéal" name="idealClientProfile" register={register} isTextArea error={errors.idealClientProfile} />
                            </div>
                        )}

                        {/* STEP 5 */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <SelectField label="Annulation" name="cancellationPolicy" register={register} options={['Annulation Flexible (24h)', 'Annulation Stricte (48h)', 'Non remboursable']} error={errors.cancellationPolicy} />
                                <CheckboxField label="Retard facturé" name="latePolicy" register={register} />
                                <CheckboxField label="Sous-traitance" name="subcontracting" register={register} />
                                <InputField label="Pain Points (Orga)" name="painPoints" register={register} isTextArea error={errors.painPoints} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer */}
                <div className="flex flex-col gap-4 mt-6 border-t border-slate-100 pt-6">
                    {errorMessage && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 animate-pulse">
                            <div className="shrink-0"><AlertCircle className="w-5 h-5" /></div>
                            <p className="text-sm font-medium">{errorMessage}</p>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button type="button" onClick={() => { setDirection(-1); setCurrentStep(s => s - 1); }} disabled={currentStep === 1} className={cn("px-4 py-2 text-slate-400", currentStep === 1 && "invisible")}>Retour</button>
                        {currentStep < 5 ? (
                            <button type="button" onClick={nextStep} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl">Suivant</button>
                        ) : (
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">{isSubmitting ? 'Envoi...' : 'Valider'}</button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

// COMPOSANTS REUTILISABLES
const TagInput = ({ tags, value, onChange, onKeyDown, onRemove, placeholder }: any) => (
    <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-slate-900 transition-all">
        {tags.map((tag: string, i: number) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg">
                {tag}
                <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => onRemove(i)} />
            </span>
        ))}
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none text-base md:text-sm p-1"
        />
    </div>
);

const InputField = ({ label, name, register, error, type = "text", isTextArea = false, className, step }: any) => (
    <div className={cn("flex flex-col space-y-1.5", className)}>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {isTextArea ? (
            <textarea {...register(name)} className="px-4 py-2 border border-slate-200 rounded-xl text-base md:text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-slate-900" />
        ) : (
            <input {...register(name, { valueAsNumber: type === 'number' })} type={type} step={step} className="px-4 py-2 border border-slate-200 rounded-xl text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900" />
        )}
        {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
);

const SelectField = ({ label, name, register, options, error }: any) => (
    <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <select {...register(name)} className="px-4 py-2 border border-slate-200 rounded-xl text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900 appearance-none bg-white">
            <option value="">Sélectionner...</option>
            {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
);

const CheckboxField = ({ label, name, register, value }: any) => (
    <label className="flex items-center space-x-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
        <input type="checkbox" value={value} {...register(name)} className="h-4 w-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900" />
        <span className="text-sm text-slate-700 font-medium">{label}</span>
    </label>
);