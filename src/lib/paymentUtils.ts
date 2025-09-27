import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, CreditCard, Wallet, Building } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="text-green-500" size={16} />;
    case 'failed':
    case 'cancelled':
      return <XCircle className="text-red-500" size={16} />;
    case 'pending':
    case 'processing':
      return <Clock className="text-yellow-500" size={16} />;
    default:
      return <AlertCircle className="text-gray-500" size={16} />;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Завершен';
    case 'failed': return 'Ошибка';
    case 'cancelled': return 'Отменен';
    case 'pending': return 'Ожидает';
    case 'processing': return 'Обработка';
    default: return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'failed':
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'pending':
    case 'processing': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPaymentMethodIcon = (gateway?: string) => {
  switch (gateway) {
    case 'alif_bank':
      return <CreditCard className="text-green-600" size={16} />;
    case 'wallet':
      return <Wallet className="text-blue-600" size={16} />;
    default:
      return <Building className="text-gray-600" size={16} />;
  }
};

export const getPaymentMethodText = (gateway?: string) => {
  switch (gateway) {
    case 'alif_bank': return 'Alif Bank';
    case 'wallet': return 'Wallet';
    case 'cash': return 'Cash';
    default: return gateway?.replace('_', ' ') || 'Unknown';
  }
};