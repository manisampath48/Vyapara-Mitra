import { Product, Customer, Sale, Invoice, DashboardStats } from '../types';

const API_BASE = ''; // Same host since Vite proxies or serves natively

// Helper wrapper to append Bearer token automatically for user scoping
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('vm_token') || sessionStorage.getItem('vm_token');
  const headers = {
    ...options.headers,
  } as Record<string, string>;
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

export async function fetchStats(): Promise<{
  stats: DashboardStats;
  charts: {
    weeklyTrend: Array<{ date: string; rawDate: string; revenue: number; profit: number }>;
    categoryDistribution: Array<{ name: string; value: number }>;
  };
  lowStockProducts: Product[];
  recentSales: Sale[];
}> {
  const res = await apiFetch(`${API_BASE}/api/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await apiFetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function addProduct(product: Partial<Product>): Promise<Product> {
  const res = await apiFetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Failed to add product');
  return res.json();
}

export async function editProduct(id: string, product: Partial<Product>): Promise<Product> {
  const res = await apiFetch(`${API_BASE}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await apiFetch(`${API_BASE}/api/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function generateCustomerReminder(id: string): Promise<string> {
  const res = await apiFetch(`${API_BASE}/api/customers/${id}/reminder`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate customer reminder');
  const data = await res.json();
  return data.reminderText;
}

export async function fetchSales(): Promise<Sale[]> {
  const res = await apiFetch(`${API_BASE}/api/sales`);
  if (!res.ok) throw new Error('Failed to fetch sales history');
  return res.json();
}

export async function createSale(saleData: {
  customerName: string;
  customerPhone?: string;
  products: Array<{ productId: string; quantity: number }>;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'DUE' | 'SPLIT';
  discountCode?: string;
  splitDetails?: { cash: number; upi: number };
}): Promise<{ sale: Sale; invoice: Invoice }> {
  const res = await apiFetch(`${API_BASE}/api/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData),
  });
  if (!res.ok) throw new Error('Failed to submit sale');
  return res.json();
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const res = await apiFetch(`${API_BASE}/api/invoices`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function sendCopilotMessage(
  message: string,
  history: Array<{ role: 'user' | 'model'; content: string }>
): Promise<string> {
  const res = await apiFetch(`${API_BASE}/api/copilot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error('Failed to get response from AI Copilot');
  const data = await res.json();
  return data.responseText;
}

export async function fetchInventoryRecommendations(): Promise<
  Array<{ productId: string; productName: string; suggestedQuantity: number; reason: string }>
> {
  const res = await apiFetch(`${API_BASE}/api/inventory/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch inventory recommendations');
  const data = await res.json();
  return data.recommendations;
}

export async function generateBusinessReport(reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'WEEKLY'): Promise<string> {
  const res = await apiFetch(`${API_BASE}/api/reports/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportType }),
  });
  if (!res.ok) throw new Error('Failed to generate business report');
  const data = await res.json();
  return data.reportMarkdown;
}

export async function resetDatabase(): Promise<void> {
  const res = await apiFetch(`${API_BASE}/api/db/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset database');
}

export interface BusinessMetadata {
  businessType: string;
  businessName: string;
  ownerName: string;
  address: string;
  phone: string;
  gstNumber?: string;
  currency: string;
  language: string;
  employees: number;
  email?: string;
  logo?: string;
  setupCompleted: boolean;
  customProducts?: Array<{ name: string; category: string; price: number; unit: string; minStock: number }>;
}

export async function fetchMetadata(): Promise<BusinessMetadata> {
  const res = await apiFetch(`${API_BASE}/api/metadata`);
  if (!res.ok) throw new Error('Failed to fetch business metadata');
  return res.json();
}

export async function setupBusiness(config: Omit<BusinessMetadata, 'setupCompleted'> & { customProducts?: any[] }): Promise<void> {
  const res = await apiFetch(`${API_BASE}/api/metadata/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to execute business setup');
}
