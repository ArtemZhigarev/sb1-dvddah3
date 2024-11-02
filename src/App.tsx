import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import UserSettings from './components/UserSettings';
import WooCommerceSettings from './components/WooCommerceSettings';
import UserSearch from './components/UserSearch';
import AllProducts from './components/AllProducts';
import AllOrders from './components/AllOrders';
import ChatwootDebug from './components/ChatwootDebug';
import ERPNextSettings from './components/ERPNext/ERPNextSettings';
import ERPNextClients from './components/ERPNext/ERPNextClients';
import ERPNextClientDetails from './components/ERPNext/ERPNextClientDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/user-settings" element={<UserSettings />} />
            <Route path="/woocommerce-settings" element={<WooCommerceSettings />} />
            <Route path="/user-search" element={<UserSearch />} />
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/all-orders" element={<AllOrders />} />
            <Route path="/chatwoot-debug" element={<ChatwootDebug />} />
            <Route path="/erpnext-settings" element={<ERPNextSettings />} />
            <Route path="/erpnext-clients" element={<ERPNextClients />} />
            <Route path="/erpnext-clients/:clientId" element={<ERPNextClientDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;