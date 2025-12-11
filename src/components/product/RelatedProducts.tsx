import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import type { Product } from '../../lib/types';
import { getRelatedProducts } from '../../lib/api';
import { formatCurrency, getVariantLabel } from '../../lib/utils';
import ProductSizeModal from '../products/ProductSizeModal';
import ProductConfirmationModal from '../products/ProductConfirmationModal';
import { getProductVariants } from '../../lib/api';
import type { ProductVariant } from '../../lib/types';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

interface RelatedProductsProps {
  productId: string;
  currentProductName?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  productId,
  currentProductName
}) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    loadRelatedProducts();
  }, [productId]);

  const loadRelatedProducts = async () => {
    try {
      setLoading(true);
      const products = await getRelatedProducts(productId);
      setRelatedProducts(products);
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const variants = await getProductVariants(product.id);
      setProductVariants(variants);
      setSelectedProduct(product);

      if (variants.length === 0) {
        // No variants, add directly to cart
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        };
        addItem(cartItem);
        toast.success('Товар добавлен в корзину');
        return;
      }

      // Has variants, show size modal
      setShowSizeModal(true);
    } catch (error) {
      console.error('Error loading variants:', error);
      toast.error('Ошибка при загрузке вариантов товара');
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setShowSizeModal(false);
    setShowConfirmationModal(true);
  };

  const handleCloseModals = () => {
    setShowSizeModal(false);
    setShowConfirmationModal(false);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setProductVariants([]);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct || !selectedVariant) return;
    
    const variantLabel = getVariantLabel(selectedVariant, selectedProduct.category);
    const cartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedVariant.price,
      quantity: 1,
      image_url: selectedProduct.image_url,
      size: variantLabel,
      variant_id: selectedVariant.id
    };
    
    addItem(cartItem);
    toast.success('Товар добавлен в корзину');
    handleCloseModals();
  };

  if (loading) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="flex gap-3 overflow-x-auto">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-shrink-0 w-32 bg-gray-200 rounded-lg h-40"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show section if no related products
  }

  return (
    <>
      <section className="mt-6 pt-6 border-t border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Сопутствующие товары
          </h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {relatedProducts.map((product) => {
            const isInStock = product.variants?.some(
              v => v.inventory?.in_stock || (v.inventory?.stock_quantity ?? 0) > 0
            ) ?? true;

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-32 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Product Image */}
                <div
                  className="relative aspect-square cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.sale_percentage && (
                    <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      -{product.sale_percentage}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <h3
                    className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-2">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </div>
                    {product.old_price && product.old_price > 0 && product.old_price > product.price && (
                      <div className="text-[10px] text-gray-500 line-through">
                        {formatCurrency(product.old_price)}
                      </div>
                    )}
                  </div>

                  {/* Plus Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={!isInStock}
                    className={`
                      w-full h-8 rounded-lg flex items-center justify-center transition-all
                      ${
                        isInStock
                          ? 'bg-brand-turquoise text-white hover:bg-brand-navy hover:scale-105 shadow-md'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                      }
                    `}
                    title={isInStock ? 'Добавить в корзину' : 'Нет в наличии'}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modals */}
      {selectedProduct && (
        <>
          <ProductSizeModal
            isOpen={showSizeModal}
            onClose={handleCloseModals}
            onSelectSize={handleVariantSelect}
            productName={selectedProduct.name}
            variants={productVariants}
            category={selectedProduct.category}
          />

          {selectedVariant && (
            <ProductConfirmationModal
              isOpen={showConfirmationModal}
              onClose={handleCloseModals}
              onAddToCart={handleConfirmAddToCart}
              product={selectedProduct}
              selectedVariant={selectedVariant}
              category={selectedProduct.category}
            />
          )}
        </>
      )}
    </>
  );
};

export default RelatedProducts;

