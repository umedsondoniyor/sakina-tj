import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductVariantForm from './ProductVariantForm';
import type { ProductVariant, Product } from '../../lib/types';

type VariantRow = ProductVariant & {
  product_name?: string;
  inventory?: {
    stock_quantity: number | null;
    in_stock: boolean | null;
    location_id: string | null;
  };
};

const AdminProductVariants: React.FC = () => {
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [filterType, setFilterType] = useState<string>('all');

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
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load product variants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;
    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) throw error;
      setVariants((prev) => prev.filter((v) => v.id !== id));
      toast.success('Variant deleted successfully');
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    }
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

      toast.success(newInStock ? 'Marked as in stock' : 'Marked as out of stock');
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast.error('Failed to update stock status');
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

  const filteredVariants = filterType === 'all' ? variants : variants.filter((v) => v.size_type === filterType);

  const sizeTypes = ['pillow', 'mattress', 'bed', 'sofa', 'blanket', 'furniture'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Variants Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </button>
      </div>

      {/* Filter by size type */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filterType === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All ({variants.length})
          </button>
          {sizeTypes.map((type) => {
            const count = variants.filter((v) => v.size_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  filterType === type ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {type} ({count})
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
            {filterType === 'all' ? 'No variants found' : `No ${filterType} variants found`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new variant.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  {/* Sticky Actions header */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{variant.product_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{variant.size_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{variant.size_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.size_type === 'pillow' && variant.height_cm && `h: ${variant.height_cm}cm`}
                      {['mattress', 'bed'].includes(variant.size_type || '') &&
                        variant.width_cm &&
                        variant.length_cm &&
                        `${variant.width_cm}×${variant.length_cm}cm`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <span className="font-medium">{variant.price?.toLocaleString()} c.</span>
                        {variant.old_price && (
                          <div className="text-xs text-gray-500 line-through">{variant.old_price.toLocaleString()} c.</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStock(variant)}
                        className={`px-2 py-1 rounded text-xs ${
                          variant.inventory?.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {variant.inventory?.in_stock
                          ? `In Stock (${variant.inventory?.stock_quantity ?? 0})`
                          : 'Out of Stock'}
                      </button>
                    </td>
                    {/* Sticky Actions cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(variant)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variant.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {filteredVariants.map((v) => (
              <div key={v.id} className="bg-white rounded-lg shadow border border-gray-100 p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{v.product_name}</div>
                    <div className="text-xs text-gray-500 capitalize">{v.size_type}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{v.price?.toLocaleString()} c.</div>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-gray-600">Size: {v.size_name}</span>
                    {['mattress', 'bed'].includes(v.size_type || '') && v.width_cm && v.length_cm && (
                      <span className="text-gray-600">Dims: {v.width_cm}×{v.length_cm}cm</span>
                    )}
                    {v.size_type === 'pillow' && v.height_cm && (
                      <span className="text-gray-600">Height: {v.height_cm}cm</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => toggleStock(v)}
                    className={`px-2 py-1 rounded text-xs ${
                      v.inventory?.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {v.inventory?.in_stock
                      ? `In Stock (${v.inventory?.stock_quantity ?? 0})`
                      : 'Out of Stock'}
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(v)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ProductVariantForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variant={selectedVariant}
        products={products}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminProductVariants;
