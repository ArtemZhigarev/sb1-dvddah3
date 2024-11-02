import React from 'react';
import { Store } from 'lucide-react';
import { WooCommerceServer } from '../services/woocommerce';

interface StoreSelectorProps {
  servers: WooCommerceServer[];
  selectedServers: string[];
  onSelectionChange: (serverIds: string[]) => void;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({
  servers,
  selectedServers,
  onSelectionChange,
}) => {
  const handleCheckboxChange = (serverId: string) => {
    const newSelection = selectedServers.includes(serverId)
      ? selectedServers.filter(id => id !== serverId)
      : [...selectedServers, serverId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Store className="w-5 h-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filter by Store:</span>
      </div>
      <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
        {servers.map(server => (
          <label
            key={server.id}
            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          >
            <input
              type="checkbox"
              checked={selectedServers.includes(server.id)}
              onChange={() => handleCheckboxChange(server.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700">{server.name}</span>
              <span className="ml-2 text-xs text-gray-500">({server.url})</span>
            </div>
            <span
              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                server.status === 'online'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {server.status}
            </span>
          </label>
        ))}
        {servers.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">
            No stores configured. Please add stores in settings.
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSelector;