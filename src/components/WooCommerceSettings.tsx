import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, RefreshCw, Check, X, Server, Globe, Key } from 'lucide-react';
import WooCommerceService, { WooCommerceServer } from '../services/woocommerce';

const WooCommerceSettings: React.FC = () => {
  const [servers, setServers] = useState<WooCommerceServer[]>([]);
  const [showAddServer, setShowAddServer] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    url: '',
    consumerKey: '',
    consumerSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServers();
    // Start monitoring when component mounts
    WooCommerceService.startMonitoring(setServers);
    
    // Stop monitoring when component unmounts
    return () => {
      WooCommerceService.stopMonitoring(setServers);
    };
  }, []);

  const loadServers = () => {
    const serverList = WooCommerceService.getServers();
    setServers(serverList);
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const server = await WooCommerceService.addServer(newServer);
      const { status, errorMessage } = await WooCommerceService.checkServerStatus(server);
      
      WooCommerceService.updateServer(server.id, { status, errorMessage });
      setShowAddServer(false);
      setNewServer({ name: '', url: '', consumerKey: '', consumerSecret: '' });
      loadServers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add server');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = (serverId: string) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      WooCommerceService.deleteServer(serverId);
      loadServers();
    }
  };

  const handleSetActiveServer = (serverId: string) => {
    WooCommerceService.setActiveServer(serverId);
    loadServers();
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      await WooCommerceService.checkAllServersStatus();
      loadServers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check server status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">WooCommerce Servers</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddServer(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Server
            </button>
            <button
              onClick={handleCheckStatus}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Check Status
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {showAddServer && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Server</h3>
            <form onSubmit={handleAddServer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Server Name</label>
                <input
                  type="text"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Server URL</label>
                <input
                  type="url"
                  value={newServer.url}
                  onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Consumer Key</label>
                <input
                  type="text"
                  value={newServer.consumerKey}
                  onChange={(e) => setNewServer({ ...newServer, consumerKey: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Consumer Secret</label>
                <input
                  type="password"
                  value={newServer.consumerSecret}
                  onChange={(e) => setNewServer({ ...newServer, consumerSecret: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddServer(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Server'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {servers.map((server) => (
            <div
              key={server.id}
              className={`border rounded-lg p-4 ${
                server.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Server className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="text-lg font-semibold">{server.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Globe className="w-4 h-4" />
                      <span>{server.url}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      server.status === 'online'
                        ? 'bg-green-100 text-green-800'
                        : server.status === 'offline'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {server.status}
                  </span>
                  {!server.isActive && (
                    <button
                      onClick={() => handleSetActiveServer(server.id)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Set as active server"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteServer(server.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Delete server"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {server.errorMessage && (
                <div className="mt-2 text-sm text-red-600">
                  Error: {server.errorMessage}
                </div>
              )}
              {server.lastChecked && (
                <div className="mt-2 text-sm text-gray-500">
                  Last checked: {new Date(server.lastChecked).toLocaleString()}
                </div>
              )}
            </div>
          ))}

          {servers.length === 0 && !showAddServer && (
            <div className="text-center py-8 text-gray-500">
              No servers configured. Click "Add Server" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WooCommerceSettings;