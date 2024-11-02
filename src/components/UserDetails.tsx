import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Package, User, Mail, Phone, Calendar, X } from 'lucide-react';
import WooCommerceService from '../services/woocommerce';

interface UserOrder {
  id: number;
  status: string;
  total: string;
  date_created: string;
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: string;
  }>;
}

interface UserDetailsProps {
  userId: number;
  onClose: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const activeServer = WooCommerceService.getActiveServer();

      if (!activeServer) {
        throw new Error('No active WooCommerce server configured.');
      }

      const [userResponse, ordersResponse] = await Promise.all([
        axios.get(`${activeServer.url}/wp-json/wc/v3/customers/${userId}`, {
          auth: {
            username: activeServer.consumerKey,
            password: activeServer.consumerSecret
          }
        }),
        axios.get(`${activeServer.url}/wp-json/wc/v3/orders`, {
          auth: {
            username: activeServer.consumerKey,
            password: activeServer.consumerSecret
          },
          params: {
            customer: userId,
            per_page: 100
          }
        })
      ]);

      setUser(userResponse.data);
      setOrders(ordersResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {user.first_name} {user.last_name}
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </p>
                    {user.billing && (
                      <>
                        {user.billing.phone && (
                          <p className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {user.billing.phone}
                          </p>
                        )}
                        <p className="text-gray-600">
                          {[
                            user.billing.address_1,
                            user.billing.address_2,
                            user.billing.city,
                            user.billing.state,
                            user.billing.postcode,
                            user.billing.country
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Order History</h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-500 mr-2" />
                          <span className="font-medium">Order #{order.id}</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'on-hold'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.date_created).toLocaleDateString()}
                        </div>
                        <div>Total: ${order.total}</div>
                      </div>
                      {order.line_items && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Items:</p>
                          <ul className="list-disc list-inside">
                            {order.line_items.map((item) => (
                              <li key={item.id}>
                                {item.name} (x{item.quantity}) - ${item.price}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No orders found for this user.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;