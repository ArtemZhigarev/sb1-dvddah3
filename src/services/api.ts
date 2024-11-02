import axios from 'axios';

export interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  chatwootDataReceived: boolean;
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    // Fetch WooCommerce data
    const wooCommerceUrl = localStorage.getItem('woocommerce_url');
    const consumerKey = localStorage.getItem('woocommerce_consumer_key');
    const consumerSecret = localStorage.getItem('woocommerce_consumer_secret');

    if (!wooCommerceUrl || !consumerKey || !consumerSecret) {
      throw new Error('WooCommerce settings are not configured. Please set them in the WooCommerce Settings page.');
    }

    const wooCommerceResponse = await axios.get(`${wooCommerceUrl}/wp-json/wc/v3/reports/sales`, {
      auth: {
        username: consumerKey,
        password: consumerSecret
      },
      params: {
        period: 'year'
      }
    });

    // For now, we'll just set a flag indicating whether Chatwoot data was received
    const chatwootDataReceived = false; // This will be updated when actual Chatwoot integration is implemented

    return {
      totalUsers: wooCommerceResponse.data.total_customers || 0,
      totalOrders: wooCommerceResponse.data.total_orders || 0,
      totalRevenue: wooCommerceResponse.data.total_sales || 0,
      chatwootDataReceived
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export const fetchChatwootData = async (): Promise<void> => {
  // This function will be implemented when Chatwoot integration is ready
  console.log('Fetching Chatwoot data...');
  // For now, it's just a placeholder
};