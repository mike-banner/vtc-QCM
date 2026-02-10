---
description: Implémentation du formulaire "Minimalist Luxury" VTC
---

1.  **Configuration du Projet (Si nécessaire)**
    - Initialisation Astro (si non fait).
    - Installation des dépendances : `react`, `tailwindcss`, `framer-motion`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`.

2.  **Schéma de Données (Zod)**
    - Création de `src/lib/schema.ts`.
    - Définition des 4 étapes (Identité, Tarification, Expérience, Vision) avec 5 questions chacune.
    - Validation stricte pour chaque champ.

3.  **Composants UI (Minimalist Luxury)**
    - Design : Fond `bg-slate-50`, Carte blanche `rounded-2xl shadow-sm`.
    - Typography : Inter ou Geist (via Fontsource ou Tailwind).
    - Transitions : `framer-motion` (Fade & Scale).
    - Icons : `lucide-react`.

4.  **Implémentation du Formulaire**
    - `src/components/OnboardingForm.tsx` : Gestion de l'état multi-étapes, validation Zod, soumission.
    - `src/components/ui/Input.tsx` : Composant input réutilisable stylisé.
    - `src/components/ui/Select.tsx` : Composant select réutilisable.

5.  **API & Backend**
    - `src/pages/api/submit.ts` : Endpoint API Astro pour recevoir les données et les transmettre au webhook n8n.

6.  **Page Principale**
    - `src/pages/index.astro` : Mise en page globale, intégration du formulaire.

// turbo-all
