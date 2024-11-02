import axios, { AxiosError, AxiosResponse } from 'axios';

// Interfaces remain the same
export interface ERPNextClient {
  name: string;
  customer_name: string;
  customer_group: string;
  territory: string;
  customer_type: string;
  email: string;
  phone: string;
  mobile_no: string;
  address: string;
  tax_id: string;
  customer_primary_contact: string;
  creation: string;
  modified: string;
}

export interface ERPNextOrder {
  name: string;
  customer: string;
  transaction_date: string;
  grand_total: number;
  status: string;
  items: Array<{
    item_code: string;
    item_name: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
}

export interface ERPNextComment {
  name: string;
  comment_type: string;
  content: string;
  creation: string;
  owner: string;
}

export interface ERPNextError {
  message: string;
  details?: Record<string, unknown>;
}

export interface DebugCallback {
  (step: string, details: Record<string, unknown>): void;
}

const normalizeUrl = (url: string): string => {
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  return normalizedUrl.endsWith('/') ? normalizedUrl.slice(0, -1) : normalizedUrl;
};

const handleAxiosError = (error: unknown): ERPNextError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message,
      details: {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    };
  }
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred'
  };
};

const getAuthToken = async (
  baseUrl: string, 
  apiKey: string, 
  apiSecret: string,
  debug?: DebugCallback
): Promise<string> => {
  try {
    debug?.('Initiating authentication request', {
      url: `${baseUrl}/api/method/frappe.auth.get_token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await axios.post(`${baseUrl}/api/method/frappe.auth.get_token`, {
      api_key: apiKey,
      api_secret: apiSecret
    });
    
    debug?.('Authentication response received', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    if (!response.data?.token) {
      throw new Error('No token received from ERPNext');
    }
    
    return response.data.token;
  } catch (error) {
    const formattedError = handleAxiosError(error);
    debug?.('Authentication failed', formattedError);
    throw new Error(`Authentication failed: ${formattedError.message}`);
  }
};

export const testERPNextConnection = async (
  url: string,
  apiKey: string,
  apiSecret: string,
  debug?: DebugCallback
): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> => {
  try {
    const baseUrl = normalizeUrl(url);
    debug?.('URL normalized', { originalUrl: url, normalizedUrl: baseUrl });

    debug?.('Attempting to get auth token', {
      url: baseUrl,
      apiKeyLength: apiKey.length,
      apiSecretLength: apiSecret.length
    });

    const token = await getAuthToken(baseUrl, apiKey, apiSecret, debug);
    
    debug?.('Testing user authentication', {
      url: `${baseUrl}/api/method/frappe.auth.get_logged_user`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const response = await axios.get(`${baseUrl}/api/method/frappe.auth.get_logged_user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    debug?.('User authentication response', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return {
      success: true,
      message: 'Successfully connected to ERPNext',
      details: {
        user: response.data?.message,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const formattedError = handleAxiosError(error);
    debug?.('Connection test failed', formattedError);
    return {
      success: false,
      message: `Connection failed: ${formattedError.message}`,
      details: formattedError.details
    };
  }
};

// Rest of the file remains the same
export const fetchERPNextClients = async (
  url: string,
  apiKey: string,
  apiSecret: string,
  searchQuery: string = ''
): Promise<ERPNextClient[]> => {
  try {
    const baseUrl = normalizeUrl(url);
    const token = await getAuthToken(baseUrl, apiKey, apiSecret);
    
    const filters = searchQuery 
      ? JSON.stringify([["Customer", "customer_name", "like", `%${searchQuery}%`]])
      : undefined;

    const response = await axios.get(`${baseUrl}/api/resource/Customer`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: {
        fields: '["*"]',
        filters
      }
    });

    return response.data?.data || [];
  } catch (error) {
    const formattedError = handleAxiosError(error);
    throw new Error(`Failed to fetch clients: ${formattedError.message}`);
  }
};

export const fetchClientDetails = async (
  url: string,
  apiKey: string,
  apiSecret: string,
  clientId: string
): Promise<ERPNextClient> => {
  try {
    const baseUrl = normalizeUrl(url);
    const token = await getAuthToken(baseUrl, apiKey, apiSecret);

    const response = await axios.get(`${baseUrl}/api/resource/Customer/${encodeURIComponent(clientId)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    return response.data?.data;
  } catch (error) {
    const formattedError = handleAxiosError(error);
    throw new Error(`Failed to fetch client details: ${formattedError.message}`);
  }
};

export const fetchClientOrders = async (
  url: string,
  apiKey: string,
  apiSecret: string,
  clientId: string
): Promise<ERPNextOrder[]> => {
  try {
    const baseUrl = normalizeUrl(url);
    const token = await getAuthToken(baseUrl, apiKey, apiSecret);

    const filters = JSON.stringify([["Sales Order", "customer", "=", clientId]]);
    
    const response = await axios.get(`${baseUrl}/api/resource/Sales Order`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: {
        fields: '["*"]',
        filters
      }
    });

    return response.data?.data || [];
  } catch (error) {
    const formattedError = handleAxiosError(error);
    throw new Error(`Failed to fetch client orders: ${formattedError.message}`);
  }
};

export const fetchClientComments = async (
  url: string,
  apiKey: string,
  apiSecret: string,
  clientId: string
): Promise<ERPNextComment[]> => {
  try {
    const baseUrl = normalizeUrl(url);
    const token = await getAuthToken(baseUrl, apiKey, apiSecret);

    const filters = JSON.stringify([["Comment", "reference_name", "=", clientId]]);
    
    const response = await axios.get(`${baseUrl}/api/resource/Comment`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: {
        fields: '["*"]',
        filters
      }
    });

    return response.data?.data || [];
  } catch (error) {
    const formattedError = handleAxiosError(error);
    throw new Error(`Failed to fetch client comments: ${formattedError.message}`);
  }
};