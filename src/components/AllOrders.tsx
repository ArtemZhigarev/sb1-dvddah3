import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, ShoppingBag, ArrowUpDown, Search } from 'lucide-react';
import WooCommerceService, { WooCommerceServer } from '../services/woocommerce';
import OrderDetails from './OrderDetails';
import StoreSelector from './StoreSelector';

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  customer_id: number;
  customer_note: string;
  notes: Array<{
    id: number;
    author: string;
    date_created: string;
    note: string;
    customer_note: boolean;
  }>;
  store?: {
    id: string;
    name: string;
  };
}

interface LoadingProgress {
  total: number;
  current: number;
  store: string;
}

const AllOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ total: 0, current: 0, store: '' });
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<'id' | 'date_created'>('date_created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [servers, setServers] = useState<WooCommerceServer[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  useEffect(() => {
    const allServers = WooCommerceService.getServers();
    setServers(allServers);
    setSelectedServers(allServers.filter(s => s.status === 'online').map(s => s.id));
  }, []);

  useEffect(() => {
    if (selectedServers.length > 0) {
      setOrders([]);
      setPage(1);
      fetchOrders();
    }
  }, [selectedServers]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress({ total: selectedServers.length, current: 0, store: '' });

    try {
      setLoadingStatus('Connecting to stores...');
      const orderPromises = selectedServers.map(async (serverId, index) => {
        const server = servers.find(s => s.id === serverId);
        if (!server) return [];

        try {
          setLoadingProgress(prev => ({
            ...prev,
            current: index,
            store: server.name
          }));
          setLoadingStatus(`Fetching orders from ${server.name}...`);

          // Fetch orders
          const ordersResponse = await axios.get(`${server.url}/wp-json/wc/v3/orders`, {
            auth: {
              username: server.consumerKey,
              password: server.consumerSecret
            },
            params: {
              per_page: 20,
              page: page,
              search: searchTerm
            }
          });

          // Fetch notes for each order
          const ordersWithNotes = await Promise.all(
            ordersResponse.data.map(async (order: Order) => {
              setLoadingStatus(`Fetching notes for order #${order.number}...`);
              const notesResponse = await axios.get(
                `${server.url}/wp-json/wc/v3/orders/${order.id}/notes`,
                {
                  auth: {
                    username: server.consumerKey,
                    password: server.consumerSecret
                  }
                }
              );
              return {
                ...order,
                notes: notesResponse.data,
                store: {
                  id: server.id,
                  name: server.name
                }
              };
            })
          );

          return ordersWithNotes;
        } catch (error) {
          console.error(`Error fetching orders from ${server.name}:`, error);
          return [];
        }
      });

      setLoadingStatus('Processing order data...');
      const allOrdersArrays = await Promise.all(orderPromises);
      const allOrders = allOrdersArrays.flat();

      setOrders(prevOrders => {
        const newOrders = allOrders.filter((newOrder: Order) => 
          !prevOrders.some(existingOrder => 
            existingOrder.id === newOrder.id && existingOrder.store?.id === newOrder.store?.id
          )
        );
        return [...prevOrders, ...newOrders];
      });
      setHasMore(allOrders.length === selectedServers.length * 20);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleSort = (field: 'id' | 'date_created') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOrders([]);
    setPage(1);
    fetchOrders();
  };

  const getProgressPercentage = () => {
    if (loadingProgress.total === 0) return 0;
    return Math.round((loadingProgress.current / loadingProgress.total) * 100);
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'id') {
      return (a.id - b.id) * direction;
    } else {
      const dateA = new Date(a.date_created).getTime();
      const dateB = new Date(b.date_created).getTime();
      return (dateA - dateB) * direction;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header and controls remain the same */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">All Orders</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="flex-1 sm:flex-initial">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSort('id')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                sortField === 'id' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              } hover:bg-blue-50`}
            >
              Order ID
              <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'id' ? 'text-blue-800' : 'text-gray-500'}`} />
            </button>
            <button
              onClick={() => handleSort('date_created')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                sortField === 'date_created' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              } hover:bg-blue-50`}
            >
              Date
              <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'date_created' ? 'text-blue-800' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      </div>

      <StoreSelector
        servers={servers}
        selectedServers={selectedServers}
        onSelectionChange={setSelectedServers}
      />

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex items-center justify-between w-full text-sm text-gray-500">
                <span>{loadingStatus}</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              {loadingProgress.store && (
                <p className="text-sm text-gray-600">
                  Store: {loadingProgress.store} ({loadingProgress.current + 1} of {loadingProgress.total})
                </p>
              )}
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      )}

      {/* Orders list remains the same */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sortedOrders.map((order) => (
            <li
              key={`${order.store?.id}-${order.id}`}
              onClick={() => setSelectedOrder(order)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        Order #{order.number}
                      </p>
                      {order.store && (
                        <p className="text-xs text-gray-500">
                          Store: {order.store.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Customer ID: {order.customer_id}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>Total: {order.total}</p>
                    <p className="ml-4">Date: {new Date(order.date_created).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {hasMore && !loading && orders.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage(prevPage => prevPage + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && sortedOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No orders found matching your search.' : selectedServers.length === 0 ? 'Please select at least one store to view orders.' : 'No orders found.'}
        </div>
      )}

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default AllOrders;