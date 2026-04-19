import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product, ProductVariant, CartItem } from '../../lib/types';
import { getRelatedProducts, getProductVariants } from '../../lib/api';
import { getProductPath } from '../../lib/productUrl';
import { formatCurrency, getVariantLabel, getProductIdFromCartLineId } from '../../lib/utils';
import ProductSizeModal from '../products/ProductSizeModal';
import ProductConfirmationModal from '../products/ProductConfirmationModal';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

interface CartRelatedProductsProps {
  cartItems: CartItem[];
}

/**
 * Cross-sell strip for the cart drawer: related products for line items,
 * compact so main cart rows stay visually dominant.
 */
const CartRelatedProducts: React.FC<CartRelatedProductsProps> = ({ cartItems }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    const sourceIds = [
      ...new Set(cartItems.map((i) => getProductIdFromCartLineId(i.id))),
    ];
    if (sourceIds.length === 0) {
      setRelated([]);
      setLoading(false);
      return;
    }

    const cartProductIds = new Set(
      cartItems.map((i) => getProductIdFromCartLineId(i.id)),
    );
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const lists = await Promise.all(sourceIds.map((id) => getRelatedProducts(id)));
        if (cancelled) return;

        const seen = new Set<string>();
        const merged: Product[] = [];
        for (const list of lists) {
          for (const p of list) {
            if (!p?.id || cartProductIds.has(p.id) || seen.has(p.id)) continue;
            seen.add(p.id);
            merged.push(p);
            if (merged.length >= 8) break;
          }
          if (merged.length >= 8) break;
        }
        setRelated(merged);
      } catch (e) {
        console.error('[CartRelatedProducts]', e);
        if (!cancelled) setRelated([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cartItems]);

  const handleProductClick = (product: Product) => {
    navigate(getProductPath(product));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const variants = await getProductVariants(product.id);
      setProductVariants(variants);
      setSelectedProduct(product);

      if (variants.length === 0) {
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url,
        };
        addItem(cartItem);
        toast.success('Товар добавлен в корзину');
        return;
      }

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
    const cartItem: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedVariant.price,
      quantity: 1,
      image_url: selectedProduct.image_url,
      size: variantLabel,
      variant_id: selectedVariant.id,
    };

    addItem(cartItem);
    toast.success('Товар добавлен в корзину');
    handleCloseModals();
  };

  if (loading && related.length === 0) {
    return (
      <div className="pt-4 mt-4 border-t border-gray-100">
        <div className="h-3.5 bg-gray-100 rounded w-36 mb-3 animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-[92px] h-[120px] bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (related.length === 0) {
    return null;
  }

  return (
    <>
      <div className="pt-4 mt-4 border-t border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Сопутствующие товары
        </h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {related.map((product) => {
            const isInStock =
              product.variants?.some(
                (v) => v.inventory?.in_stock || (v.inventory?.stock_quantity ?? 0) > 0,
              ) ?? true;

            return (
              <div
                key={product.id}
                className="shrink-0 w-[92px] rounded-lg border border-gray-100 bg-gray-50/80 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  className="relative block w-full aspect-[4/3] bg-white"
                  onClick={() => handleProductClick(product)}
                  aria-label={product.name}
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.sale_percentage ? (
                    <span className="absolute top-0.5 left-0.5 bg-red-500 text-white text-[9px] font-bold px-1 rounded">
                      -{product.sale_percentage}%
                    </span>
                  ) : null}
                </button>
                <div className="p-1.5">
                  <p className="text-[10px] font-medium text-gray-800 line-clamp-2 leading-tight mb-1 min-h-[2rem]">
                    {product.name}
                  </p>
                  <p className="text-[11px] font-bold text-gray-900 mb-1.5 tabular-nums">
                    {formatCurrency(product.price)}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={!isInStock}
                    className={`w-full h-7 rounded-md flex items-center justify-center transition-colors ${
                      isInStock
                        ? 'bg-brand-turquoise text-white hover:bg-brand-navy'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title={isInStock ? 'Добавить в корзину' : 'Нет в наличии'}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProduct ? (
        <>
          <ProductSizeModal
            isOpen={showSizeModal}
            onClose={handleCloseModals}
            onSelectSize={handleVariantSelect}
            productName={selectedProduct.name}
            variants={productVariants}
            category={selectedProduct.category}
          />
          {selectedVariant ? (
            <ProductConfirmationModal
              isOpen={showConfirmationModal}
              onClose={handleCloseModals}
              onAddToCart={handleConfirmAddToCart}
              product={selectedProduct}
              selectedVariant={selectedVariant}
              category={selectedProduct.category}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default CartRelatedProducts;
