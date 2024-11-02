import React from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Settings, Search, Package, ShoppingBag, Bug, Users, Building2 } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-xl font-semibold text-gray-800">
              <Home className="w-6 h-6 mr-2" />
              Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/user-search" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Search className="w-5 h-5 mr-1" />
              User Search
            </Link>
            <Link to="/all-products" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Package className="w-5 h-5 mr-1" />
              Products
            </Link>
            <Link to="/all-orders" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <ShoppingBag className="w-5 h-5 mr-1" />
              Orders
            </Link>
            <Link to="/erpnext-clients" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Users className="w-5 h-5 mr-1" />
              ERPNext Clients
            </Link>
            <div className="relative group">
              <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                <Settings className="w-5 h-5 mr-1" />
                Settings
              </button>
              <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg hidden group-hover:block">
                <div className="py-1">
                  <Link to="/user-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="w-4 h-4 inline mr-2" />
                    User Settings
                  </Link>
                  <Link to="/woocommerce-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <ShoppingBag className="w-4 h-4 inline mr-2" />
                    WooCommerce
                  </Link>
                  <Link to="/erpnext-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    ERPNext
                  </Link>
                  <Link to="/chatwoot-debug" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Bug className="w-4 h-4 inline mr-2" />
                    Debug
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;