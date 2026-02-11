# Plan de Correction : Réparation du bouton "Suivant" (Étape 4)

## Analyse du Problème
Le bouton "Suivant" à l'étape 4 ne fonctionne pas car la validation du formulaire échoue.
- **Cause Racine** : Le champ `multiStopPolicy` est requis dans le schéma de validation (`z.enum(['Inclus', 'Sur devis', 'Interdit'])`) mais il est absent de l'interface utilisateur (JSX).
- **Conséquence** : La fonction `trigger()` échoue silencieusement sur ce champ manquant, empêchant le passage à l'étape suivante.

## Solution Proposée
Nous allons ajouter le champ manquant `multiStopPolicy` dans le formulaire et mettre à jour la liste des champs validés lors du clic sur "Suivant".

### 1. Modification du composant `OnboardingForm.tsx`

#### A. Ajout du champ manquant dans le JSX (Étape 4)
Nous allons ajouter un `SelectField` pour `multiStopPolicy` (Politique multi-arrêts).

```tsx
<SelectField 
    label="Politique arrêts multiples" 
    name="multiStopPolicy" 
    register={register} 
    options={['Inclus', 'Sur devis', 'Interdit']} 
/>
```

#### B. Mise à jour de la fonction `nextStep`
Nous allons compléter la liste des champs à valider pour l'étape 4 pour inclure tous les champs présents et le nouveau champ.

```typescript
case 4: fields = [
    'serviceArea', 
    'langues', 
    'interet_tourisme', 
    'tarifs_fixes_aeroport', // Ajouté
    'breakManagement', 
    'multiStopPolicy', 
    'premiumServices', // Ajouté (présent dans le JSX)
    'idealClientProfile'
]; break;
```

Cela garantira que tous les champs sont correctement validés et que l'utilisateur peut passer à l'étape 5.
