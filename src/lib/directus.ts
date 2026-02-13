// /home/mike/projects/vtc/vtc-questions/src/lib/directus.ts

/**
 * Types pour la collection onboarding_drivers
 */
export interface OnboardingEntry {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft';
    prenom: string;
    nom: string;
    email: string;
    nom_entreprise: string;
    categorie_vehicule: string;
    capacite_passagers?: number;
    capacite_bagages?: number;
    immatriculation?: string; // Corrigé
    applied_hub_code?: string;
    point_noir_admin?: string;

    assurance_file?: string;
    carte_pro_file?: string;
    kbis_file?: string; // Ajouté car vu dans grep
    rib_file?: string;
    photo_vehicule?: string; // Ajouté car vu dans grep

    telephone?: string;
    carte_pro_num?: string;

    // Pricing & Config (pour mapping vehicle_settings)
    tarif_4h?: string | number;
    tarif_8h?: string | number;
    km_inclus?: number;
    prix_km_supp?: string | number;
    zone_intervention?: any;
    langues?: any;
    options_bord?: any;
    acompte_percent?: number;
    modele_prix?: string;
    moment_paiement?: string;
    gestion_pauses?: string;
    politique_multi_stop?: string;
    profil_client_ideal?: string;
    suivi_temps_reel?: boolean;
    compte_fidelite?: boolean;

    created_at?: string;
    updated_at?: string;
}

/**
 * Types pour la collection entreprises
 */
export interface Entreprise {
    id: string;
    nom_legal: string; // Corrigé
    email?: string;
    account_type: 'solo' | 'team' | 'driver';
    hub_id?: string | null;
    created_at?: string;
    is_active?: boolean;
}

/**
 * Types pour la collection drivers
 */
export interface Driver {
    id: string;
    entreprise_id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    carte_pro_num?: string;
    is_available?: boolean;
    status: 'active' | 'inactive';
    created_at?: string;
}

/**
 * Types pour la collection hubs
 */
export interface Hub {
    id: string;
    nom: string;
    invite_code?: string; // Corrigé
}

/**
 * Client Directus simplifié
 */
export class DirectusClient {
    private baseUrl: string;
    private token: string;

    constructor() {
        // Nettoyer l'URL (retirer le slash final si présent)
        const rawUrl = import.meta.env.DIRECTUS_URL;
        this.baseUrl = rawUrl?.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
        this.token = import.meta.env.DIRECTUS_TOKEN;

        if (!this.baseUrl || !this.token) {
            throw new Error('DIRECTUS_URL et DIRECTUS_TOKEN doivent être définis dans .env');
        }
    }

    /**
     * Récupère les données d'un chauffeur par son ID
     */
    async getOnboardingById(id: string): Promise<OnboardingEntry | null> {
        try {
            const url = `${this.baseUrl}/items/onboarding_drivers/${id}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) return null;

            const data = await response.json();
            return data.data || null;
        } catch (error) {
            console.error('Erreur lors de la récupération du chauffeur:', error);
            return null;
        }
    }

    /**
     * Récupère tous les hubs
     */
    async getHubs(): Promise<Hub[]> {
        try {
            const url = `${this.baseUrl}/items/hubs?sort=nom`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur récupération hubs');

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur getHubs:', error);
            return [];
        }
    }

    /**
     * Récupère toutes les entrées avec un certain statut
     */
    async getOnboardingByStatus(status: string): Promise<OnboardingEntry[]> {
        try {
            const url = `${this.baseUrl}/items/onboarding_drivers?filter[status][_eq]=${status}&sort=-created_at`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur Directus: ${response.status}`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            throw error;
        }
    }

    /**
     * Récupère les entreprises solos
     */
    async getEntreprisesSolo(): Promise<Entreprise[]> {
        try {
            // On récupère tout et on filtre si besoin, ou on tente le filtre Directus
            // Note: nom_legal est le champ correct
            const url = `${this.baseUrl}/items/entreprises?filter[account_type][_eq]=solo&sort=-created_at`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.warn("Filtre account_type en échec, tentative sans filtre...");
                const fallbackUrl = `${this.baseUrl}/items/entreprises?sort=-created_at`;
                const fbRes = await fetch(fallbackUrl, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                const data = await fbRes.json();
                return (data.data || []).filter((e: any) => e.account_type === 'solo' || !e.hub_id);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des entreprises solos:', error);
            return [];
        }
    }

    /**
     * Récupère les entreprises en équipe
     */
    async getEntreprisesEquipe(): Promise<Entreprise[]> {
        try {
            const url = `${this.baseUrl}/items/entreprises?filter[hub_id][_nnull]=true&sort=-created_at`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const fallbackUrl = `${this.baseUrl}/items/entreprises?sort=-created_at`;
                const fbRes = await fetch(fallbackUrl, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                const data = await fbRes.json();
                return (data.data || []).filter((e: any) => e.hub_id !== null && e.hub_id !== undefined);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des entreprises équipes:', error);
            return [];
        }
    }

    /**
     * Crée une nouvelle entreprise
     */
    async createEntreprise(data: any): Promise<any> {
        try {
            const url = `${this.baseUrl}/items/entreprises`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.error("Détail erreur création entreprise:", err);
                throw new Error(`Erreur Directus (createEntreprise): ${response.status}`);
            }

            const resData = await response.json();
            return resData.data;
        } catch (error) {
            console.error('Erreur lors de la création de l\'entreprise:', error);
            throw error;
        }
    }

    /**
     * Met à jour une entreprise
     */
    async updateEntreprise(id: string, data: Partial<Entreprise>): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/items/entreprises/${id}`;

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return response.ok;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
            return false;
        }
    }

    /**
     * Met à jour le statut et éventuellement le point noir
     */
    async updatePartnerStatus(id: string, data: { status: string, point_noir_admin?: string }): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/items/onboarding_drivers/${id}`;

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return response.ok;
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            return false;
        }
    }

    async createDriver(data: any): Promise<any> {
        const url = `${this.baseUrl}/items/drivers`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`Erreur Directus (createDriver): ${response.status} ${JSON.stringify(errorBody)}`);
        }

        const resData = await response.json();
        return resData.data;
    }

    async createVehicle(data: any): Promise<any> {
        const url = `${this.baseUrl}/items/vehicles`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`Erreur Directus (createVehicle): ${response.status} ${JSON.stringify(errorBody)}`);
        }

        const resData = await response.json();
        return resData.data;
    }

    async createVehicleSettings(data: any): Promise<any> {
        const url = `${this.baseUrl}/items/vehicle_settings`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`Erreur Directus (createVehicleSettings): ${response.status} ${JSON.stringify(errorBody)}`);
        }

        const resData = await response.json();
        return resData.data;
    }

    /**
     * Génère l'URL publique pour un fichier Directus
     */
    getFileUrl(fileId: string): string {
        if (!fileId) return '#';
        return `${this.baseUrl}/assets/${fileId}?download`;
    }
}

/**
 * Instance singleton du client
 */
export const directus = new DirectusClient();
