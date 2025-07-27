import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Heart, Eye, Truck, Box, ArrowLeftRight, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getProducts } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../lib/types';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ images, currentIndex, onClose, onPrevious, onNext }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
      >
        <X size={24} />
      </button>
      
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
        disabled={currentIndex === 0}
      >
        <ChevronLeft size={32} />
      </button>

      <img
        src={images[currentIndex]}
        alt={`Product view ${currentIndex + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain"
      />

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedSize, setSelectedSize] = React.useState('140×200');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
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

  // Check scroll possibilities whenever the container scrolls
  useEffect(() => {
    const checkScroll = () => {
      if (thumbnailsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = thumbnailsRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    const container = thumbnailsRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const productImages = product?.image_urls || [];

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailsRef.current) {
      const scrollAmount = 200; // Adjust this value to control scroll distance
      const newScrollLeft = thumbnailsRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      thumbnailsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_urls[0],
      size: selectedSize
    };
    
    addItem(cartItem);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const sizes = [
    { size: '80×200', price: 36139 },
    { size: '90×200', price: 38977 },
    { size: '140×200', price: 49895 },
    { size: '160×200', price: 53880 },
    { size: '180×200', price: 59064 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-teal-600">Матрасы</a>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div 
            className="relative cursor-zoom-in"
            ref={imageRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleImageClick}
          >
            {product.sale_percentage && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                -{product.sale_percentage}%
              </span>
            )}
            <span className="absolute top-4 right-4 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm">
              Выгодно
            </span>
            <img
              src={productImages[currentImageIndex]}
              alt={product.name}
              className="w-full rounded-lg"
            />
            {showMagnifier && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Search className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Thumbnails Carousel */}
          <div className="relative mt-4">
            {canScrollLeft && (
              <button
                onClick={() => scrollThumbnails('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <div 
              ref={thumbnailsRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide mx-4"
            >
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-none w-24 h-24 border rounded-lg overflow-hidden transition-colors ${
                    currentImageIndex === index ? 'border-teal-500' : 'hover:border-teal-500'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {canScrollRight && (
              <button
                onClick={() => scrollThumbnails('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Анатомический матрас {product.name}
          </h1>
          
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < product.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {product.review_count} отзывов
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold">
                {product.price.toLocaleString()} ₽
                {product.old_price && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    {product.old_price.toLocaleString()} ₽
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                + 2 694 бонусов
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Размер (Ш×Д)</h3>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700">
                Все размеры (14)
              </a>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sizes.map(({ size, price }) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`p-2 text-center border rounded-lg transition-colors ${
                    selectedSize === size
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-500'
                  }`}
                >
                  <div className="font-medium">{size}</div>
                  <div className="text-sm text-gray-600">
                    {price.toLocaleString()} ₽
                  </div>
                  {selectedSize === size && (
                    <div className="text-xs text-teal-600">В наличии</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Warranty Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center text-sm">
              <Box className="w-5 h-5 mr-2 text-teal-600" />
              <div>
                <div>Гарантия на товар 1.5 года</div>
                <div>35 лет при покупке с чехлом</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors"
            >
              В корзину
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:border-teal-500 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <Eye className="w-5 h-5 text-gray-600" />
              <div>
                <div>Где посмотреть</div>
                <div className="text-teal-600">в 41 салонах</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Truck className="w-5 h-5 text-gray-600" />
              <div>
                <div>Доставка на дом</div>
                <div>1000 ₽</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Box className="w-5 h-5 text-gray-600" />
              <div>
                <div>Самовывоз</div>
                <div>бесплатно</div>
                <div className="text-teal-600">в 1 пункте выдачи</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
              <div>
                <div>Легкий обмен</div>
                <div>в течение 90 дней</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <a href="#" className="text-teal-600 hover:text-teal-700 text-sm">
              Дополнительные услуги
            </a>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          images={productImages}
          currentIndex={currentImageIndex}
          onClose={() => setShowImageModal(false)}
          onPrevious={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
          onNext={() => setCurrentImageIndex(prev => Math.min(productImages.length - 1, prev + 1))}
        />
      )}
    </div>
  );
};

export default ProductPage;