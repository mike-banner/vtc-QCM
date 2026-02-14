// /home/mike/projects/vtc/vtc-questions/src/components/OnboardingForm.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Car, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { onboardingSchema, type OnboardingData } from '../lib/schema';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, title: 'Votre profil', icon: User },
    { id: 2, title: 'Votre véhicule', icon: Car },
    { id: 3, title: 'Vos tarifs', icon: DollarSign },
];

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);

    const { register, handleSubmit, trigger, formState: { errors } } = useForm<OnboardingData>({
        resolver: zodResolver(onboardingSchema),
        mode: 'onChange'
    });

    const nextStep = async () => {
        let fields: (keyof OnboardingData)[] = [];
        switch (currentStep) {
            case 1: fields = ['firstName', 'lastName', 'email', 'phonePrefix', 'phone', 'professionalLicenseNumber', 'companyName', 'accountType']; break;
            case 2: fields = ['vehicleCategory', 'vehicleModel', 'immatriculation', 'passengerCapacity', 'luggageCapacity']; break;
            case 3: fields = ['pricingModel', 'rate4h', 'rate8h', 'includedKm', 'extraKmPrice', 'depositPercent', 'paymentTiming', 'serviceArea']; break;
        }

        if (await trigger(fields)) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
            setErrorMessage(null);
        } else {
            setErrorMessage("Veuillez remplir correctement tous les champs obligatoires.");
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

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.message || "Erreur lors de l'envoi");
            }

            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            setErrorMessage(error.message || "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Dossier transmis !</h2>
                <p className="text-slate-500 mb-8">Votre candidature est en cours d'examen par notre équipe. Nous reviendrons vers vous très prochainement.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setIsSuccess(false)} className="px-8 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors">Modifier mes informations</button>
                    <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">Terminer</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-white" })}
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800">{steps[currentStep - 1].title}</h2>
                    </div>
                    <span className="text-sm font-medium text-slate-500">Étape {currentStep} sur 3</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full">
                    <motion.div className="h-full bg-slate-900 rounded-full" animate={{ width: `${(currentStep / 3) * 100}%` }} />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 min-h-[450px] flex flex-col justify-between">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div key={currentStep} initial={{ x: direction > 0 ? 30 : -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction < 0 ? 30 : -30, opacity: 0 }} className="space-y-6">

                        {currentStep === 1 && (
                            <>
                                <p className="text-sm text-slate-500">Commençons par faire connaissance. Ces informations nous permettent de créer votre compte partenaire.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="prénom" name="firstName" register={register} error={errors.firstName} />
                                    <InputField label="nom" name="lastName" register={register} error={errors.lastName} />
                                    <InputField label="Adresse e-mail pro" name="email" type="email" register={register} error={errors.email} />
                                    <PhoneInputField label="Numéro de mobile" name="phone" prefixName="phonePrefix" register={register} error={errors.phone} />
                                    <InputField label="Numéro de votre carte VTC" name="professionalLicenseNumber" register={register} error={errors.professionalLicenseNumber} />
                                    <InputField label="Nom de votre entreprise" name="companyName" register={register} error={errors.companyName} />
                                    <SelectField label="Quel est votre statut juridique ?" name="accountType" register={register} options={['Auto-entrepreneur', 'Société']} error={errors.accountType} />
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <p className="text-sm text-slate-500">Détails sur le véhicule que vous utiliserez pour vos missions de transport.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField label="Gamme de service" name="vehicleCategory" register={register} options={['Berline', 'Business', 'Van', 'VIP']} error={errors.vehicleCategory} />
                                    <InputField label="Modèle (Marque et version)" name="vehicleModel" register={register} error={errors.vehicleModel} />
                                    <InputField label="Plaque d'immatriculation" name="immatriculation" register={register} error={errors.immatriculation} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Passagers max" name="passengerCapacity" type="number" register={register} error={errors.passengerCapacity} />
                                        <InputField label="Valises max" name="luggageCapacity" type="number" register={register} error={errors.luggageCapacity} />
                                    </div>
                                </div>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <p className="text-sm text-slate-500">Configurez vos prix pour que nous puissions calculer vos prestations automatiquement.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SelectField label="Méthode de calcul des prix" name="pricingModel" register={register} options={['Forfait Horaire', 'Forfait Journée', 'Mixte']} error={errors.pricingModel} />
                                    <SelectField label="Moment du réglement" name="paymentTiming" register={register} options={['100% commande', '30% acompte', 'Paiement à bord']} error={errors.paymentTiming} />
                                    <InputField label="Prix forfaitaire 4h (€)" name="rate4h" type="number" register={register} error={errors.rate4h} />
                                    <InputField label="Prix forfaitaire 8h (€)" name="rate8h" type="number" register={register} error={errors.rate8h} />
                                    <InputField label="Distance incluse (km)" name="includedKm" type="number" register={register} error={errors.includedKm} />
                                    <InputField label="Prix du km supplémentaire (€)" name="extraKmPrice" type="number" register={register} step="0.1" error={errors.extraKmPrice} />
                                    <InputField label="Acompte demandé (%)" name="depositPercent" type="number" register={register} error={errors.depositPercent} />
                                    <SelectField label="Secteur géographique" name="serviceArea" register={register} options={['Paris Intramuros', 'Île-de-France', 'France Entière']} error={errors.serviceArea} />
                                </div>
                            </>
                        )}

                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">{errorMessage}</p>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <button type="button" onClick={() => { setDirection(-1); setCurrentStep(s => s - 1); }} disabled={currentStep === 1} className={cn("px-4 py-2 text-slate-400 font-medium", currentStep === 1 && "invisible")}>Retour</button>
                        {currentStep < 3 ? (
                            <button type="button" onClick={nextStep} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">Suivant</button>
                        ) : (
                            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">{isSubmitting ? 'Envoi...' : 'Valider mon dossier'}</button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

const InputField = ({ label, name, register, error, type = "text", className, step }: any) => (
    <div className={cn("flex flex-col space-y-1.5", className)}>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <input {...register(name, { valueAsNumber: type === 'number' })} type={type} step={step} className="px-4 py-2 border border-slate-200 rounded-xl text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900" />
        {error && <span className="text-xs text-red-500 font-medium">{error.message}</span>}
    </div>
);

const SelectField = ({ label, name, register, options, error }: any) => (
    <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <select {...register(name)} className="px-4 py-2 border border-slate-200 rounded-xl text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900 bg-white">
            <option value="">Sélectionner...</option>
            {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <span className="text-xs text-red-500 font-medium">{error.message}</span>}
    </div>
);

const PhoneInputField = ({ label, name, prefixName, register, error }: any) => (
    <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex gap-2">
            <select
                {...register(prefixName)}
                className="w-24 px-2 py-2 border border-slate-200 rounded-xl text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
                <option value="+33">FR (+33)</option>
                <option value="+32">BE (+32)</option>
                <option value="+41">CH (+41)</option>
                <option value="+352">LU (+352)</option>
                <option value="+44">UK (+44)</option>
                <option value="+1">US (+1)</option>
                <option value="+221">SN (+221)</option>
                <option value="+225">CI (+225)</option>
                <option value="+212">MA (+212)</option>
            </select>
            <input
                {...register(name)}
                type="tel"
                placeholder="6 12 34 56 78"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error.message}</span>}
    </div>
);