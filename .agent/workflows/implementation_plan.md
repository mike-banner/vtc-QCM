---
description: Implémentation du formulaire "Minimalist Luxury" VTC
---

# VTC Platform — Implementation Source of Truth

This document defines the current architecture and structural rules.
Agent must respect:

- Onboarding ≠ production
- Entreprise ≠ chauffeur
- Availability = driver-level
- Configuration = vehicle-level
- No business logic in frontend
- Directus API only (no raw SQL from Astro)

This is the reference architecture for V1.


---

## 1. OBJECTIVE

Build a structured onboarding validation system allowing:

- Chauffeur onboarding submission
- Admin validation (approve / reject)
- Automatic creation of production entities
- Clean and scalable database architecture
- Future-proof structure for SaaS evolution

Scope of V1:
- Admin-only backoffice
- No public site
- No chauffeur login
- No multi-tenant SaaS exposure

---

## 2. SYSTEM ARCHITECTURE

### Stack

- Astro (Frontend + API Routes)
- Directus (Data layer)
- PostgreSQL
- Cloudflare deployment

### Authentication

- Admin login handled internally in Astro
- Directus used only as data storage
- Directus admin token used server-side only
- No public Directus authentication exposed

---

## 3. DATABASE STRUCTURE

### 3.1 onboarding_drivers (Temporary Intake Table)

Purpose:
Store raw onboarding submissions.

Status values:
- draft
- pending
- approved
- rejected

Rules:
- Never used for operational logic
- Editable even after approval

---

### 3.2 entreprises (Business Entity)

Represents validated legal entity.

Fields:
- id
- nom_legal
- stripe_account_id
- domaine_astro
- account_type
- hub_id
- is_active
- created_at

Rules:
- Contains only stable business-level data
- No chauffeur-specific fields
- No availability fields

---

### 3.3 drivers (Human Entity)

Represents operational chauffeur.

Fields:
- id
- entreprise_id
- prenom
- nom
- telephone
- email
- carte_pro_num
- status
- is_available
- created_at

Rules:
- Availability belongs here
- Professional license belongs here

---

### 3.4 vehicles (Material Entity)

Represents physical vehicle.

Fields:
- id
- entreprise_id
- driver_id
- categorie
- modele
- immatriculation
- capacite_passagers
- capacite_bagages
- photo
- is_active
- created_at

Rules:
- One entreprise can have multiple vehicles
- One driver can be linked to one or multiple vehicles

---

### 3.5 vehicle_settings (Commercial Configuration)

Represents pricing & operational configuration.

Fields:
- vehicle_id
- tarif_4h
- tarif_8h
- km_inclus
- prix_km_supp
- acompte_percent
- zone_intervention
- langues
- options_bord
- modele_prix
- moment_paiement
- gestion_pauses
- politique_multi_stop
- profil_client_ideal
- suivi_temps_reel
- compte_fidelite

Rules:
- Configuration separated from vehicle core data
- No business identity stored here

---

### 3.6 hubs (Team Structure)

Optional grouping of entreprises.

Allows:
- Multi-entreprise collaboration
- Commission management

---

### 3.7 courses

Prepared for future operational management.

---

## 4. BUSINESS FLOW

---

### Phase 1 — Onboarding Submission

Frontend multi-step form  
→ `/api/submit`  
→ Zod validation  
→ Create record in `onboarding_drivers`

No entreprise creation at this stage.

---

### Phase 2 — Admin Validation

Admin dashboard allows:

- View onboarding entries
- Edit onboarding entries
- Approve
- Reject

---

### Phase 3 — Approval Flow

When admin approves:

1. Fetch onboarding entry
2. Create entreprise
3. Create driver
4. Create vehicle
5. Create vehicle_settings
6. Update onboarding status = approved

Constraints:
- Use Directus API only
- No raw SQL from Astro
- All wrapped in try/catch
- Log errors properly

---

## 5. ONBOARDING EDIT RULE

Onboarding entries remain editable even after approval.

Important:
- Editing onboarding does NOT automatically update production entities.
- Synchronization logic may be implemented later.
- Onboarding remains input source, not live configuration.

---

## 6. STRUCTURAL RULES

- Onboarding ≠ production
- Entreprise ≠ chauffeur
- Availability = driver-level
- Commercial configuration = vehicle-level
- Entreprise = stable business entity
- No business logic in frontend

---

## 7. CURRENT STATUS

- Database refactored
- entreprises cleaned
- drivers / vehicles / vehicle_settings created
- Admin approval flow in implementation
- Onboarding submission functional

---

## 8. CURRENT PRIORITY

Stabilize:

- Approval creation flow
- Data integrity
- Clean TypeScript types
- No duplicated fields
- No cross-responsibility mixing

---

## 9. NOT INCLUDED IN V1

- Public site
- Chauffeur dashboard
- Multi-tenant isolation
- Stripe automation
- Subdomain routing
- Team management UI

---

## 10. FUTURE EVOLUTION (V2+)

- Dynamic public site per entreprise
- Chauffeur authentication
- Multi-driver per entreprise
- Stripe Connect integration
- SaaS isolation layer
- Role management

---

## CORE PRINCIPLE

Build a stable and scalable data structure before expanding features.
