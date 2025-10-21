import React from 'react';
import { Star } from 'lucide-react';
import type { Product, ProductVariant } from '../../lib/types';
import PillowSizeModal from './PillowSizeModal';
import PillowConfirmationModal from './PillowConfirmationModal';
import { useCart } from '../../contexts/CartContext';
import { getProductVariants } from '../../lib/api';

interface ProductGridProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
  const [showSizeModal, setShowSizeModal] = React.useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);
  const [productVariants, setProductVariants] = React.useState<ProductVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = React.useState(false);
  const { addItem } = useCart();

  const handleCloseModals = () => {
    setShowSizeModal(false);
    setShowConfirmationModal(false);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setProductVariants([]);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if product has variants or is a category that typically has variants
    if (product.variants && product.variants.length > 0) {
      // Product already has variants loaded
      setSelectedProduct(product);
      setProductVariants(product.variants);
      setShowSizeModal(true);
    } else if (['pillows', 'mattresses', 'beds'].includes(product.category)) {
      // Load variants for this product
      loadProductVariants(product);
    } else {
      // For products without variants, add directly to cart
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url
      };
      addItem(cartItem);
    }
  };

  const loadProductVariants = async (product: Product) => {
    try {
      setLoadingVariants(true);
      setSelectedProduct(product);
      
      const variants = await getProductVariants(product.id);
      setProductVariants(variants);
      
      if (variants.length > 0) {
        setShowSizeModal(true);
      } else {
        // No variants found, add product with default price
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        };
        addItem(cartItem);
      }
    } catch (error) {
      console.error('Error loading product variants:', error);
      // Fallback to adding product without variants
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url
      };
      addItem(cartItem);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (!selectedProduct) return;
    
    // Store the selected variant and show confirmation modal
    setSelectedVariant(variant);
    setShowSizeModal(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct || !selectedVariant) return;
    
    const cartItem = {
      id: `${selectedProduct.id}_${selectedVariant.id}`,
      name: selectedProduct.name,
      price: selectedVariant.price,
      quantity: 1,
      image_url: selectedProduct.image_url,
      size: selectedVariant.height_cm 
        ? `${selectedVariant.size_name}, h - ${selectedVariant.height_cm} см`
        : selectedVariant.width_cm && selectedVariant.length_cm
        ? `${selectedVariant.width_cm}×${selectedVariant.length_cm}`
        : selectedVariant.size_name,
      variant_id: selectedVariant.id
    };
    
    addItem(cartItem);
    setShowConfirmationModal(false);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setProductVariants([]);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          Товары не найдены
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group cursor-pointer"
            onClick={() => onProductClick(product.id)}
          >
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
            <div>
              <div className="flex items-center mb-2">

                <span className="text-sm text-gray-500 ml-2">{product.review_count}</span>
              </div>
              <h3 className="font-medium mb-2 group-hover:text-teal-600 line-clamp-2">
                {product.name}
              </h3>
              {product.weight_category && (
                <p className="text-sm text-gray-600 mb-2">
                  Рекомендуемый вес: {product.weight_category}
                </p>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{product.price.toLocaleString()} c.</span>
                {product.old_price && (
                  <span className="text-sm text-gray-500 line-through">
                    {product.old_price.toLocaleString()} c.
                  </span>
                )}
              </div>
              <button 
                className="w-full mt-4 bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition-colors"
                onClick={(e) => handleAddToCart(product, e)}
                disabled={loadingVariants}
              >
                {loadingVariants ? 'Загрузка...' : 'В корзину'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pillow Size Selection Modal */}
      <PillowSizeModal
        isOpen={showSizeModal}
        onClose={handleCloseModals}
        onSelectSize={handleVariantSelect}
        productName={selectedProduct?.name || ''}
        variants={productVariants}
      />

      {/* Pillow Confirmation Modal */}
      <PillowConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModals}
        onAddToCart={handleConfirmAddToCart}
        productName={selectedProduct?.name || ''}
        selectedVariant={selectedVariant!}
      />
    </>
  );
};

export default ProductGrid;