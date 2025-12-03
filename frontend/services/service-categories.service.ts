export interface ServiceCategory {
  id: number;
  name: string;
  value: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  basePrice: number;
  pricePerMile: number;
  serviceType: 'MEDICAL' | 'GENERAL';
  createdAt: string;
  updatedAt: string;
}

export class ServiceCategoriesService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/service-categories`;

  private static async authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async getAll(): Promise<ServiceCategory[]> {
    const data = await this.authFetch(this.baseUrl);
    return data.data;
  }

  static async getActive(): Promise<ServiceCategory[]> {
    const data = await this.authFetch(`${this.baseUrl}/active`);
    return data.data;
  }

  static async getById(id: number): Promise<ServiceCategory> {
    const data = await this.authFetch(`${this.baseUrl}/${id}`);
    return data.data;
  }

  static async create(category: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCategory> {
    const data = await this.authFetch(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return data.data;
  }

  static async update(id: number, category: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const data = await this.authFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
    return data.data;
  }

  static async delete(id: number): Promise<void> {
    await this.authFetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  static async toggleStatus(id: number): Promise<ServiceCategory> {
    const data = await this.authFetch(`${this.baseUrl}/${id}/toggle-status`, {
      method: 'PUT',
    });
    return data.data;
  }
}