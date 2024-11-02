import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Search, User, Phone, Mail } from 'lucide-react';
import { fetchERPNextClients, ERPNextClient } from '../../services/erpnext';

const ERPNextClients: React.FC = () => {
  const [clients, setClients] = useState<ERPNextClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = localStorage.getItem('erpnext_url');
        const apiKey = localStorage.getItem('erpnext_api_key');
        const apiSecret = localStorage.getItem('erpnext_api_secret');

        if (!url || !apiKey || !apiSecret) {
          throw new Error('ERPNext settings are not configured. Please set them in the ERPNext Settings page.');
        }

        const data = await fetchERPNextClients(url, apiKey, apiSecret, searchQuery);
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">ERPNext Clients</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link
              key={client.name}
              to={`/erpnext-clients/${client.name}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{client.customer_name}</h3>
                  <p className="text-sm text-gray-500">{client.customer_group}</p>
                  
                  {client.phone && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {client.phone}
                    </div>
                  )}
                  
                  {client.email && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                  )}
                  
                  <div className="mt-4 text-sm text-gray-500">
                    Created: {new Date(client.creation).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && clients.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No clients found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
};

export default ERPNextClients;