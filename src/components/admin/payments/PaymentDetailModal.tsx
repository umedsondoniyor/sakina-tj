import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { getStatusIcon, getStatusText, getStatusColor, getPaymentMethodIcon } from '../../../lib/paymentUtils';

interface Payment {
  id: string;
  alif_order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  alif_transaction_id?: string;
  user_id?: string;
  product_title?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_type?: string;
  delivery_address?: string;
  payment_gateway?: string;
  created_at: string;
  updated_at: string;
  order_summary?: Record<string, any>;
  alif_callback_payload?: Record<string, any>;
}

interface PaymentDetailModalProps {
  payment: Payment;
  onDelete: (paymentId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  onDelete,
  onClose,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Payment Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDelete(payment.id)}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              aria-label="Delete this payment"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Payment Status</h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon(payment.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Amount</h3>
              <p className="text-2xl font-bold text-green-600">
                {Number(payment.amount).toLocaleString()} {payment.currency}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
              <div className="flex items-center space-x-2">
                {getPaymentMethodIcon(payment.payment_gateway)}
                <span className="capitalize">{payment.payment_gateway?.replace('_', ' ') || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{payment.customer_name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{payment.customer_email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{payment.customer_phone || 'Not provided'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Type:</span>
                  <span className="font-medium">
                    {payment.delivery_type === 'home' ? 'Home Delivery' : 
                     payment.delivery_type === 'pickup' ? 'Pickup' : 
                     payment.delivery_type || 'Not specified'}
                  </span>
                </div>
                {payment.delivery_address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{payment.delivery_address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm">{payment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{payment.alif_order_id}</span>
                </div>
                {payment.alif_transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm">{payment.alif_transaction_id}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(payment.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">
                    {new Date(payment.updated_at).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {payment.order_summary && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
                  {JSON.stringify(payment.order_summary, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Callback Payload */}
          {payment.alif_callback_payload && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Alif Callback Data</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
                  {JSON.stringify(payment.alif_callback_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;