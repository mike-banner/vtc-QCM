# Formulaire d'Onboarding VTC - Minimalist Luxury

Ce projet est une application web moderne construite avec **Astro** pour un service de VTC haut de gamme. Il met en avant un formulaire d'inscription interactif et élégant.

## 🚀 Stack Technique

Le projet utilise les technologies suivantes :
- **Framework** : [Astro](https://astro.build)
- **UI & Logique** : [React](https://react.dev)
- **Styles** : [Tailwind CSS](https://tailwindcss.com) + `tailwind-merge` + `clsx`
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Formulaires** : [React Hook Form](https://react-hook-form.com)
- **Validation** : [Zod](https://zod.dev) & `@hookform/resolvers`
- **Icônes** : [Lucide React](https://lucide.dev)

## 🛠️ Prérequis

Assure-toi d'avoir **Node.js** installé (version 18+ recommandée).

## 📦 Installation

Clone le projet et installe les dépendances :

```bash
npm install
```

## 💻 Lancer le projet

Pour démarrer le serveur de développement localement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:4321`.

## 🏗️ Structure du Code

Voici un aperçu des dossiers importants :

- `src/pages/` : Contient les routes de l'application (ex: `index.astro`).
- `src/components/` : Contient les composants React, notamment le formulaire principal `OnboardingForm.tsx`.
- `src/lib/` : Contient les fonctions utilitaires et les schémas de validation Zod (`schema.ts`).

## ✨ Fonctionnalités Clés

- **Design Premium** : Interface soignée avec une esthétique "Minimalist Luxury".
- **Validation Robuste** : Schémas Zod pour garantir l'intégrité des données saisies (email pro, véhicule, capacité, etc.).
- **Expérience Fluide** : Animations de transition entre les étapes du formulaire.

---

*Développé pour une expérience utilisateur d'excellence.*
