import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Package, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import {
  fetchClientDetails,
  fetchClientOrders,
  fetchClientComments,
  ERPNextClient,
  ERPNextOrder,
  ERPNextComment
} from '../../services/erpnext';

const ERPNextClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<ERPNextClient | null>(null);
  const [orders, setOrders] = useState<ERPNextOrder[]>([]);
  const [comments, setComments] = useState<ERPNextComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;

      setLoading(true);
      setError(null);

      try {
        const url = localStorage.getItem('erpnext_url');
        const apiKey = localStorage.getItem('erpnext_api_key');
        const apiSecret = localStorage.getItem('erpnext_api_secret');

        if (!url || !apiKey || !apiSecret) {
          throw new Error('ERPNext settings are not configured. Please set them in the ERPNext Settings page.');
        }

        const [clientData, ordersData, commentsData] = await Promise.all([
          fetchClientDetails(url, apiKey, apiSecret, clientId),
          fetchClientOrders(url, apiKey, apiSecret, clientId),
          fetchClientComments(url, apiKey, apiSecret, clientId)
        ]);

        setClient(clientData);
        setOrders(ordersData);
        setComments(commentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <div className="flex">
          <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{client.customer_name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Phone:</strong> {client.phone}</p>
            <p><strong>Mobile:</strong> {client.mobile_no}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Business Information</h3>
            <p><strong>Customer Group:</strong> {client.customer_group}</p>
            <p><strong>Territory:</strong> {client.territory}</p>
            <p><strong>Tax ID:</strong> {client.tax_id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order History</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-semibold">{order.name}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(order.transaction_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {order.grand_total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments & Notes</h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.name} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="text-gray-600">{comment.content}</p>
                  <div className="mt-1 text-sm text-gray-500">
                    <span>{comment.owner}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(comment.creation).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center">No comments available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ERPNextClientDetails;