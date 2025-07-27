import React from 'react';

const ProductNotFound = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    </div>
  );
};

export default ProductNotFound;