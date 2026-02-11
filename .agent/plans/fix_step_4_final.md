# Plan de Correction Complémentaire : Déblocage de l'Étape 4

## Analyse
L'utilisateur est toujours bloqué à l'étape 4.
Il manque encore deux champs dans le formulaire qui sont présents dans le schéma :
1. `realTimeTracking` (`z.boolean().default(false)`)
2. `loyaltyAccount` (`z.boolean().default(false)`)

De plus, le champ `interet_tourisme` est un nombre (`valueAsNumber: true`). Si l'utilisateur le laisse vide, React Hook Form peut envoyer `NaN`, ce qui peut faire échouer la validation `z.number()`, même avec un `default(0)`.

## Actions Correctives

### 1. Mise à jour de `src/lib/schema.ts`
Nous allons rendre la validation numérique plus robuste pour les champs qui peuvent être laissés vides (comme `interet_tourisme`), en transformant les `NaN` (champs vides) en `0`.

### 2. Mise à jour de `src/components/OnboardingForm.tsx`
1. **Ajouter les champs manquants** : Checkboxes pour `realTimeTracking` (Suivi temps réel) et `loyaltyAccount` (Compte fidélité).
2. **Mettre à jour la validation** : Ajouter ces champs à la liste `trigger` dans `nextStep`.
3. **Debug** : Ajouter un `console.log(errors)` dans la fonction `nextStep` pour voir exactement quel champ pose problème si le blocage persiste.

## Résultat attendu
Tous les champs du schéma `logisticsClientSchema` seront présents dans le formulaire et validés. La robustesse sur les nombres évitera les blocages sur les champs vides optionnels.
