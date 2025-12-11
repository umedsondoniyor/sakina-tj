import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductVariantForm from './ProductVariantForm';
import type { ProductVariant, Product } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

type VariantRow = ProductVariant & {
  product_name?: string;
  inventory?: {
    stock_quantity: number | null;
    in_stock: boolean | null;
    location_id: string | null;
  };
};

const sizeTypeLabels: Record<string, string> = {
  pillow: 'Подушка',
  mattress: 'Матрас',
  bed: 'Кровать',
  sofa: 'Диван',
  blanket: 'Одеяло',
  furniture: 'Мебель',
  map: 'Карта',
};

const AdminProductVariants: React.FC = () => {
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Variants + related product and inventory info
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select(`
          *,
          products!inner(name),
          inventory(
            stock_quantity,
            in_stock,
            location_id,
            locations!inner(name, is_active)
          )
        `)
        .order('created_at', { ascending: false });

      if (variantsError) throw variantsError;

      // Products list for the form
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, category')
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      // Flatten inventory (we use the first record)
      const transformed: VariantRow[] =
        (variantsData || []).map((v: any) => ({
          ...v,
          product_name: v.products?.name,
          inventory: v.inventory?.[0]
            ? {
                stock_quantity: v.inventory[0].stock_quantity,
                in_stock: v.inventory[0].in_stock,
                location_id: v.inventory[0].location_id,
              }
            : undefined,
        }));

      setVariants(transformed);
      // Cast to Product[] since ProductVariantForm only needs id, name, category
      setProducts((productsData || []) as Product[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Не удалось загрузить варианты товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', deleteConfirmId);
      if (error) throw error;
      setVariants((prev) => prev.filter((v) => v.id !== deleteConfirmId));
      toast.success('Вариант товара успешно удален');
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Не удалось удалить вариант товара');
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const toggleStock = async (variant: VariantRow) => {
    try {
      // default location
      const { data: defaultLocation, error: locErr } = await supabase
        .from('locations')
        .select('id')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (locErr) throw locErr;
      if (!defaultLocation) throw new Error('No active location found');

      const newInStock = !Boolean(variant.inventory?.in_stock);

      const { error } = await supabase.from('inventory').upsert({
        location_id: defaultLocation.id,
        product_variant_id: variant.id,
        in_stock: newInStock,
        stock_quantity: newInStock ? (variant.inventory?.stock_quantity || 0) : 0,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setVariants((prev) =>
        prev.map((v) =>
          v.id === variant.id
            ? {
                ...v,
                inventory: {
                  stock_quantity: newInStock ? (v.inventory?.stock_quantity || 0) : 0,
                  in_stock: newInStock,
                  location_id: v.inventory?.location_id ?? defaultLocation.id,
                },
              }
            : v
        )
      );

      toast.success(newInStock ? 'Отмечено как в наличии' : 'Отмечено как отсутствует');
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast.error('Не удалось обновить статус наличия');
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVariant(undefined);
    setIsModalOpen(true);
  };

  // Filter by type and search query
  const filteredVariants = variants.filter((v) => {
    const matchesType = filterType === 'all' || v.size_type === filterType;
    if (!matchesType) return false;
    
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.product_name?.toLowerCase().includes(query) ||
      v.size_name.toLowerCase().includes(query) ||
      v.size_type?.toLowerCase().includes(query)
    );
  });

  const sizeTypes = ['pillow', 'mattress', 'bed', 'sofa', 'blanket', 'furniture', 'map'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
          <span className="text-gray-600">Загрузка вариантов товаров...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление вариантами товаров</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          aria-label="Добавить вариант товара"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить вариант
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск по товару, размеру или типу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="ml-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Очистить
          </button>
        )}
      </div>

      {/* Filter by size type */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterType === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Все ({variants.length})
          </button>
          {sizeTypes.map((type) => {
            const count = variants.filter((v) => v.size_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterType === type ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {sizeTypeLabels[type] || type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filteredVariants.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {variants.length === 0
              ? 'Варианты товаров не найдены'
              : filterType === 'all'
              ? 'Варианты товаров не найдены'
              : `Варианты типа "${sizeTypeLabels[filterType] || filterType}" не найдены`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {variants.length === 0
              ? 'Начните с создания нового варианта товара.'
              : searchQuery
              ? `По запросу "${searchQuery}" ничего не найдено.`
              : 'Начните с создания нового варианта товара.'}
          </p>
          {(searchQuery || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-4 text-sm text-teal-600 hover:text-teal-700"
            >
              Очистить фильтры
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размеры
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Наличие
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={variant.product_name}>
                      {variant.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{variant.size_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sizeTypeLabels[variant.size_type || ''] || variant.size_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.size_type === 'pillow' && variant.height_cm && `Высота: ${variant.height_cm} см`}
                      {['mattress', 'bed'].includes(variant.size_type || '') &&
                        variant.width_cm &&
                        variant.length_cm &&
                        `${variant.width_cm}×${variant.length_cm} см`}
                      {!variant.height_cm && !variant.width_cm && '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <span className="font-medium">{variant.price ? formatCurrency(variant.price) : '—'}</span>
                        {variant.old_price && variant.old_price > 0 && (
                          <div className="text-xs text-gray-500 line-through">{formatCurrency(variant.old_price)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStock(variant)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          variant.inventory?.in_stock
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title={variant.inventory?.in_stock ? 'Нажмите, чтобы отметить как отсутствует' : 'Нажмите, чтобы отметить как в наличии'}
                      >
                        {variant.inventory?.in_stock
                          ? `В наличии (${variant.inventory?.stock_quantity ?? 0})`
                          : 'Нет в наличии'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white z-10">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(variant)}
                          className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                          aria-label="Редактировать вариант"
                          title="Редактировать"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(variant.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          aria-label="Удалить вариант"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(searchQuery || filterType !== 'all') && (
              <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
                Показано {filteredVariants.length} из {variants.length} вариантов
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {filteredVariants.map((v) => (
              <div key={v.id} className="bg-white rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate" title={v.product_name}>
                      {v.product_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sizeTypeLabels[v.size_type || ''] || v.size_type}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-right">
                    <div>{v.price ? formatCurrency(v.price) : '—'}</div>
                    {v.old_price && v.old_price > 0 && (
                      <div className="text-xs text-gray-500 line-through">{formatCurrency(v.old_price)}</div>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-gray-600">Размер: {v.size_name}</span>
                    {['mattress', 'bed'].includes(v.size_type || '') && v.width_cm && v.length_cm && (
                      <span className="text-gray-600">Размеры: {v.width_cm}×{v.length_cm} см</span>
                    )}
                    {v.size_type === 'pillow' && v.height_cm && (
                      <span className="text-gray-600">Высота: {v.height_cm} см</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => toggleStock(v)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      v.inventory?.in_stock
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {v.inventory?.in_stock
                      ? `В наличии (${v.inventory?.stock_quantity ?? 0})`
                      : 'Нет в наличии'}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors flex items-center gap-1"
                      aria-label="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="text-sm">Редактировать</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(v.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Удалить</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Подтвердите удаление
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вы уверены, что хотите удалить этот вариант товара? Это действие нельзя отменить.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProductVariantForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVariant(undefined);
        }}
        variant={selectedVariant}
        products={products}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminProductVariants;
