import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Search,
  Package,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product, RelatedProduct } from '../../lib/types';
import { 
  getRelatedProductsForAdmin, 
  addRelatedProduct, 
  removeRelatedProduct,
  updateRelatedProductOrder,
  getProducts
} from '../../lib/api';

const AdminRelatedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchRelatedProducts(selectedProduct.id);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      if (productsData.length > 0 && !selectedProduct) {
        setSelectedProduct(productsData[0]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (productId: string) => {
    try {
      setLoadingRelated(true);
      const related = await getRelatedProductsForAdmin(productId);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error fetching related products:', error);
      toast.error('Не удалось загрузить сопутствующие товары');
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddRelated = async (relatedProductId: string) => {
    if (!selectedProduct) return;

    try {
      // Check if already related
      const exists = relatedProducts.some(
        rp => rp.related_product_id === relatedProductId
      );
      if (exists) {
        toast.error('Этот товар уже добавлен как сопутствующий');
        return;
      }

      const maxOrder = relatedProducts.length > 0
        ? Math.max(...relatedProducts.map(rp => rp.display_order))
        : -1;

      await addRelatedProduct(
        selectedProduct.id,
        relatedProductId,
        maxOrder + 1
      );

      toast.success('Сопутствующий товар добавлен');
      setShowAddModal(false);
      setSearchQuery('');
      fetchRelatedProducts(selectedProduct.id);
    } catch (error: any) {
      console.error('Error adding related product:', error);
      toast.error(error.message || 'Не удалось добавить сопутствующий товар');
    }
  };

  const handleRemove = async (relationId: string) => {
    if (!confirm('Удалить этот сопутствующий товар?')) return;

    try {
      await removeRelatedProduct(relationId);
      toast.success('Сопутствующий товар удален');
      if (selectedProduct) {
        fetchRelatedProducts(selectedProduct.id);
      }
    } catch (error: any) {
      console.error('Error removing related product:', error);
      toast.error('Не удалось удалить сопутствующий товар');
    }
  };

  const handleMoveUp = async (relation: RelatedProduct, index: number) => {
    if (index === 0) return;

    try {
      const prevRelation = relatedProducts[index - 1];
      await updateRelatedProductOrder(relation.id, prevRelation.display_order);
      await updateRelatedProductOrder(prevRelation.id, relation.display_order);
      
      if (selectedProduct) {
        fetchRelatedProducts(selectedProduct.id);
      }
    } catch (error) {
      console.error('Error moving product:', error);
      toast.error('Не удалось изменить порядок');
    }
  };

  const handleMoveDown = async (relation: RelatedProduct, index: number) => {
    if (index === relatedProducts.length - 1) return;

    try {
      const nextRelation = relatedProducts[index + 1];
      await updateRelatedProductOrder(relation.id, nextRelation.display_order);
      await updateRelatedProductOrder(nextRelation.id, relation.display_order);
      
      if (selectedProduct) {
        fetchRelatedProducts(selectedProduct.id);
      }
    } catch (error) {
      console.error('Error moving product:', error);
      toast.error('Не удалось изменить порядок');
    }
  };

  const openAddModal = async () => {
    setShowAddModal(true);
    try {
      const allProducts = await getProducts();
      // Filter out already related products and the selected product itself
      const relatedIds = relatedProducts.map(rp => rp.related_product_id);
      const available = allProducts.filter(
        p => p.id !== selectedProduct?.id && !relatedIds.includes(p.id)
      );
      setAvailableProducts(available);
    } catch (error) {
      console.error('Error loading available products:', error);
    }
  };

  const filteredAvailableProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Сопутствующие товары</h1>
          <p className="text-gray-500 mt-1">Управление рекомендациями товаров</p>
        </div>
      </div>

      {/* Product Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выберите товар
        </label>
        <select
          value={selectedProduct?.id || ''}
          onChange={(e) => {
            const product = products.find(p => p.id === e.target.value);
            setSelectedProduct(product || null);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">-- Выберите товар --</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <>
          {/* Current Product Info */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="text-teal-600" size={24} />
              <div>
                <p className="text-sm text-teal-700 font-medium">Текущий товар:</p>
                <p className="text-lg font-bold text-teal-900">{selectedProduct.name}</p>
              </div>
            </div>
          </div>

          {/* Related Products List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Сопутствующие товары ({relatedProducts.length})
              </h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
              >
                <Plus size={20} />
                Добавить товар
              </button>
            </div>

            {loadingRelated ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Загрузка...</p>
              </div>
            ) : relatedProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">Нет сопутствующих товаров</p>
                <p className="text-sm text-gray-500 mt-2">
                  Добавьте товары, которые будут рекомендоваться при покупке этого товара
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {relatedProducts.map((relation, index) => (
                  <div
                    key={relation.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveUp(relation, index)}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Переместить вверх"
                          >
                            <ChevronUp size={20} />
                          </button>
                          <button
                            onClick={() => handleMoveDown(relation, index)}
                            disabled={index === relatedProducts.length - 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Переместить вниз"
                          >
                            <ChevronDown size={20} />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="flex items-center gap-4 flex-1">
                          {relation.related_product?.image_url && (
                            <img
                              src={relation.related_product.image_url}
                              alt={relation.related_product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {relation.related_product?.name || 'Товар не найден'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Порядок: {relation.display_order + 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(relation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Добавить сопутствующий товар
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск товаров..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAvailableProducts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {searchQuery ? 'Товары не найдены' : 'Нет доступных товаров'}
                  </p>
                ) : (
                  filteredAvailableProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleAddRelated(product.id)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <Plus className="text-teal-600" size={20} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRelatedProducts;

