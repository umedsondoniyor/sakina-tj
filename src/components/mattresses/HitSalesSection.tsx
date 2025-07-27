import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, PackageOpen } from 'lucide-react';
import { getBestSellers } from '../../lib/api';
import type { Product } from '../../lib/types';

const HitSalesSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    try {
      setLoading(true);
      const data = await getBestSellers();
      setProducts(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('No products available')) {
        setError('No best sellers available at the moment');
      } else {
        setError('Failed to load best sellers');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToPrev = () => {
    // Implement carousel navigation
  };

  const goToNext = () => {
    // Implement carousel navigation
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{error}</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for new products.</p>
          <button
            onClick={loadBestSellers}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mb-12">
        <div className="text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No best sellers available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for new products.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Хиты продаж</h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPrev}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <div className="relative mb-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              {product.sale_percentage && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
                  -{product.sale_percentage}%
                </span>
              )}
            </div>
            <div className="flex items-center mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">{product.review_count}</span>
            </div>
            <h3 className="font-medium mb-2 group-hover:text-teal-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg font-bold">{product.price.toLocaleString()} ₽</span>
              {product.old_price && (
                <span className="text-sm text-gray-500 line-through">
                  {product.old_price.toLocaleString()} ₽
                </span>
              )}
            </div>
            <button className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors">
              Подробнее
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HitSalesSection;