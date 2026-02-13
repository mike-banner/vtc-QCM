// /home/mike/projects/vtc/vtc-questions/src/lib/directus.ts

/**
 * ================================
 * TYPES (DATABASE SCHEMA - SNAKE_CASE)
 * ================================
 */

export interface OnboardingEntry {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    email: string;
    first_name: string;
    last_name: string;
    company_name: string;
    phone: string;
    professional_license_number: string;
    vehicle_category: string;
    vehicle_model: string;
    immatriculation: string;
    passenger_capacity: number;
    luggage_capacity: number;
    rate_4h: number;
    rate_8h: number;
    included_km: number;
    extra_km_price: number;
    deposit_percent: number;
    pricing_model: string;
    payment_timing: string;
    service_area: string;
    account_type?: string;

    // Files (Keep existing if needed for dashboard display)
    applied_hub_code?: string;
    assurance_file?: string;
    carte_pro_file?: string;
    rib_file?: string;
    carte_grise_file?: string;

    created_at?: string;
    updated_at?: string;
}

export interface Company {
    id: string;
    legal_name: string;
    phone?: string;
    email?: string;
    account_type: 'solo' | 'team' | 'driver';
    stripe_account_id?: string;
    hub_id?: string | null;
    is_active?: boolean;
    created_at?: string;
}

export interface Driver {
    id: string;
    company_id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    professional_license_number: string;
    status: 'active' | 'inactive';
    is_available?: boolean;
    created_at?: string;
}

export interface Vehicle {
    id: string;
    company_id: string;
    driver_id: string;
    category: string;
    model: string;
    immatriculation: string;
    passenger_capacity: number;
    luggage_capacity: number;
    photo?: string;
    is_active?: boolean;
    created_at?: string;
}

export interface VehicleSettings {
    id: string;
    vehicle_id: string;
    rate_4h: number;
    rate_8h: number;
    included_km: number;
    extra_km_price: number;
    deposit_percent: number;
    service_area: string;
    pricing_model: string;
    payment_timing: string;
    created_at?: string;
}

export interface Hub {
    id: string;
    nom: string;
    invite_code?: string;
}

/**
 * ================================
 * DIRECTUS CLIENT
 * ================================
 */

export class DirectusClient {
    private baseUrl: string;
    private token: string;

    constructor() {
        const rawUrl = import.meta.env.DIRECTUS_URL;
        this.baseUrl = rawUrl?.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
        this.token = import.meta.env.DIRECTUS_TOKEN;

        if (!this.baseUrl || !this.token) {
            throw new Error('DIRECTUS_URL et DIRECTUS_TOKEN doivent être définis dans .env');
        }
    }

    async getOnboardingById(id: string): Promise<OnboardingEntry | null> {
        const response = await fetch(`${this.baseUrl}/items/onboarding_drivers/${id}`, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.data || null;
    }

    async getOnboardingByStatus(status: string): Promise<OnboardingEntry[]> {
        const response = await fetch(
            `${this.baseUrl}/items/onboarding_drivers?filter[status][_eq]=${status}&sort=-created_at`,
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (!response.ok) throw new Error('Erreur récupération onboarding');
        const data = await response.json();
        return data.data || [];
    }

    async updatePartnerStatus(id: string, data: any): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/items/onboarding_drivers/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.ok;
    }

    async updateCompany(id: string, data: any): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/items/companies/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.ok;
    }

    async getCompanyByEmail(email: string): Promise<Company | null> {
        const response = await fetch(
            `${this.baseUrl}/items/companies?filter[email][_eq]=${email}&limit=1`,
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.[0] || null;
    }

    async createCompany(data: Partial<Company>): Promise<Company> {
        const response = await fetch(`${this.baseUrl}/items/companies`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`Erreur createCompany: ${JSON.stringify(err)}`);
        }
        const res = await response.json();
        return res.data;
    }

    async getCompaniesSolo(): Promise<Company[]> {
        const response = await fetch(
            `${this.baseUrl}/items/companies?filter[account_type][_eq]=solo&sort=-created_at`,
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
        const data = await response.json();
        return data.data || [];
    }

    async getCompaniesTeam(): Promise<Company[]> {
        const response = await fetch(
            `${this.baseUrl}/items/companies?filter[account_type][_eq]=team&sort=-created_at`,
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
        const data = await response.json();
        return data.data || [];
    }

    async getHubs(): Promise<Hub[]> {
        const response = await fetch(`${this.baseUrl}/items/hubs?sort=nom`, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await response.json();
        return data.data || [];
    }

    async getDriverByEmail(email: string): Promise<Driver | null> {
        const response = await fetch(
            `${this.baseUrl}/items/drivers?filter[email][_eq]=${email}&limit=1`,
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.[0] || null;
    }

    async createDriver(data: Partial<Driver>): Promise<Driver> {
        const response = await fetch(`${this.baseUrl}/items/drivers`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erreur createDriver');
        const res = await response.json();
        return res.data;
    }

    async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
        const response = await fetch(`${this.baseUrl}/items/vehicles`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erreur createVehicle');
        const res = await response.json();
        return res.data;
    }

    async getVehicleByDriverId(driverId: string): Promise<Vehicle | null> {
        const response = await fetch(
            `${this.baseUrl}/items/vehicles?filter[driver_id][_eq]=${driverId}&limit=1`,
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.[0] || null;
    }

    async createVehicleSettings(data: Partial<VehicleSettings>): Promise<VehicleSettings> {
        const response = await fetch(`${this.baseUrl}/items/vehicle_settings`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erreur createVehicleSettings');
        const res = await response.json();
        return res.data;
    }

    async getVehicleSettingsByVehicleId(vehicleId: string): Promise<VehicleSettings | null> {
        const response = await fetch(
            `${this.baseUrl}/items/vehicle_settings?filter[vehicle_id][_eq]=${vehicleId}&limit=1`,
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.[0] || null;
    }

    getFileUrl(fileId: string): string {
        if (!fileId) return '#';
        return `${this.baseUrl}/assets/${fileId}?download`;
    }
}

export const directus = new DirectusClient();
