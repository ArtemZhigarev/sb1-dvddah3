import React from 'react';
import { Package, Calendar, User, Mail, Phone, MapPin, X, MessageSquare, UserCircle, Lock, MessageCircleMore } from 'lucide-react';

interface OrderNote {
  id: number;
  author: string;
  date_created: string;
  note: string;
  customer_note: boolean;
}

interface OrderDetailsProps {
  order: {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    customer_id: number;
    customer_note?: string;
    notes?: OrderNote[];
    billing?: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      address_1?: string;
      address_2?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
    shipping?: {
      first_name: string;
      last_name: string;
      address_1?: string;
      address_2?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
    line_items?: Array<{
      id: number;
      name: string;
      quantity: number;
      price: string;
      total: string;
    }>;
    shipping_total?: string;
    total_tax?: string;
  };
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const adminNotes = order.notes?.filter(note => !note.customer_note) || [];
  const customerNotes = order.notes?.filter(note => note.customer_note) || [];
  const hasNotes = adminNotes.length > 0 || customerNotes.length > 0 || order.customer_note;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6 z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg w-full max-w-4xl my-8">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Order #{order.number}</h2>
            <span
              className={`px-2 py-1 rounded-full text-sm font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {order.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-6 space-y-6">
          {/* Notes Section */}
          {hasNotes && (
            <div className="space-y-4">
              {/* Customer Notes */}
              {(order.customer_note || customerNotes.length > 0) && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-yellow-800">
                    <MessageCircleMore className="w-5 h-5 mr-2" />
                    Customer Notes
                  </h3>
                  <div className="space-y-4">
                    {order.customer_note && (
                      <div className="bg-white rounded p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-1">Order Note:</p>
                        <p className="text-gray-800">{order.customer_note}</p>
                      </div>
                    )}
                    {customerNotes.map((note) => (
                      <div key={note.id} className="bg-white rounded p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-gray-600">
                            From Customer
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(note.date_created).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-800">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {adminNotes.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                    <Lock className="w-5 h-5 mr-2" />
                    Private Admin Notes
                  </h3>
                  <div className="space-y-4">
                    {adminNotes.map((note) => (
                      <div key={note.id} className="bg-white rounded p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-blue-600">
                            {note.author || 'System'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(note.date_created).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-800">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Billing Information</h4>
                <div className="space-y-2 text-gray-600">
                  <p className="font-medium">{order.billing?.first_name} {order.billing?.last_name}</p>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="break-all">{order.billing?.email}</span>
                  </p>
                  {order.billing?.phone && (
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      {order.billing.phone}
                    </p>
                  )}
                  <p className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <span className="break-words">
                      {[
                        order.billing?.address_1,
                        order.billing?.address_2,
                        order.billing?.city,
                        order.billing?.state,
                        order.billing?.postcode,
                        order.billing?.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Shipping Information</h4>
                <div className="space-y-2 text-gray-600">
                  <p className="font-medium">{order.shipping?.first_name} {order.shipping?.last_name}</p>
                  <p className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <span className="break-words">
                      {[
                        order.shipping?.address_1,
                        order.shipping?.address_2,
                        order.shipping?.city,
                        order.shipping?.state,
                        order.shipping?.postcode,
                        order.shipping?.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="bg-white border rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.line_items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="break-words max-w-xs">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        ${parseFloat(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${parseFloat(order.total).toFixed(2)}</span>
                </div>
                {order.shipping_total && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">${parseFloat(order.shipping_total).toFixed(2)}</span>
                  </div>
                )}
                {order.total_tax && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${parseFloat(order.total_tax).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer with close button for mobile */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:hidden rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;