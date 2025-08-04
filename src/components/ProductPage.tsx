import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import type { Product, ProductVariant } from '../lib/types';

// Import subcomponents
import ProductBreadcrumbs from './product/ProductBreadcrumbs';
import ProductImageGallery from './product/ProductImageGallery';
import ProductInfo from './product/ProductInfo';
import ProductLoadingState from './product/ProductLoadingState';
import ProductNotFound from './product/ProductNotFound';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);
  const { addItem } = useCart();
  
  React.useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await getProducts();
        const foundProduct = products.find(p => p.id === id);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = selectedVariant ? {
      id: `${product.id}_${selectedVariant.id}`,
      name: product.name,
      price: selectedVariant.price,
      quantity: 1,
      image_url: product.image_urls[0],
      size: product.category === 'pillows' && selectedVariant.height_cm
        ? `${selectedVariant.size_name}, h - ${selectedVariant.height_cm}см`
        : selectedVariant.width_cm && selectedVariant.length_cm
        ? `${selectedVariant.width_cm}×${selectedVariant.length_cm}`
        : selectedVariant.size_name,
      variant_id: selectedVariant.id
    } : {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_urls[0]
    };
    
    addItem(cartItem);
  };

  if (loading) {
    return <ProductLoadingState />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const productImages = product?.image_urls || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <ProductBreadcrumbs productName={product.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <ProductImageGallery
          images={productImages}
          productName={product.name}
          salePercentage={product.sale_percentage}
        />

        {/* Product Info */}
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
};

export default ProductPage;