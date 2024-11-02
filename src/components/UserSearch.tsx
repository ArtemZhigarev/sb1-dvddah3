import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, AlertCircle, User } from 'lucide-react';
import WooCommerceService from '../services/woocommerce';
import UserDetails from './UserDetails';

interface WooCommerceUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

const UserSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<WooCommerceUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers(true);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchUsers(false);
    }
  }, [page]);

  const fetchUsers = async (resetPage: boolean = false) => {
    if (resetPage) {
      setPage(1);
      setUsers([]);
    }

    setLoading(true);
    setError(null);

    try {
      const activeServer = WooCommerceService.getActiveServer();

      if (!activeServer) {
        throw new Error('No active WooCommerce server configured. Please set up a server in the Settings page.');
      }

      const response = await axios.get(`${activeServer.url}/wp-json/wc/v3/customers`, {
        auth: {
          username: activeServer.consumerKey,
          password: activeServer.consumerSecret
        },
        params: {
          search: searchTerm,
          per_page: 20,
          page: resetPage ? 1 : page
        }
      });

      setUsers(prevUsers => {
        if (resetPage) {
          return response.data;
        }
        const newUsers = response.data.filter((newUser: WooCommerceUser) => 
          !prevUsers.some(existingUser => existingUser.id === newUser.id)
        );
        return [...prevUsers, ...newUsers];
      });
      setHasMore(response.data.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(true);
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">User Search</h1>
      
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, username, or name"
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

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

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedUserId(user.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <p className="text-sm text-gray-500 truncate">Username: {user.username}</p>
                </div>
                <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                  ID: {user.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {hasMore && !loading && users.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No users found matching your search criteria.' : 'No users found in the system.'}
        </div>
      )}

      {selectedUserId && (
        <UserDetails
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

export default UserSearch;