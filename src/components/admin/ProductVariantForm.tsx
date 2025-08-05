import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { ProductVariant, Product } from '../../lib/types';

interface ProductVariantFormProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: ProductVariant;
  products: Product[];
  onSuccess: () => void;
}

const sizeTypes = [
  { value: 'pillow', label: 'Pillow' },
  { value: 'mattress', label: 'Mattress' },
  { value: 'bed', label: 'Bed' },
  { value: 'sofa', label: 'Sofa' },
  { value: 'blanket', label: 'Blanket' },
  { value: 'furniture', label: 'Furniture' },
];

const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  isOpen,
  onClose,
  variant,
  products,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    size_name: '',
    size_type: 'mattress' as const,
    height_cm: '',
    width_cm: '',
    length_cm: '',
    price: '',
    old_price: '',
    display_order: '0',
    stock_quantity: '0',
    in_stock: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (variant) {
      setFormData({
        product_id: variant.product_id,
        size_name: variant.size_name,
        size_type: variant.size_type,
        height_cm: variant.height_cm?.toString() || '',
        width_cm: variant.width_cm?.toString() || '',
        length_cm: variant.length_cm?.toString() || '',
        price: variant.price.toString(),
        old_price: variant.old_price?.toString() || '',
        display_order: variant.display_order.toString(),
        stock_quantity: variant.inventory?.stock_quantity?.toString() || '0',
        in_stock: variant.inventory?.in_stock ?? true
      });
    } else {
      setFormData({
        product_id: '',
        size_name: '',
        size_type: 'mattress',
        height_cm: '',
        width_cm: '',
        length_cm: '',
        price: '',
        old_price: '',
        display_order: '0',
        stock_quantity: '0',
        in_stock: true
      });
    }
    setError('');
  }, [variant, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.product_id || !formData.size_name || !formData.price) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }

      // Prepare data for submission
      const variantData = {
        product_id: formData.product_id,
        size_name: formData.size_name,
        size_type: formData.size_type,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        width_cm: formData.width_cm ? parseFloat(formData.width_cm) : null,
        length_cm: formData.length_cm ? parseFloat(formData.length_cm) : null,
        price: price,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        display_order: parseInt(formData.display_order) || 0,
        updated_at: new Date().toISOString()
      };

      // Get default location
      const { data: defaultLocation, error: locationError } = await supabase
        .from('locations')
        .select('id')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (locationError || !defaultLocation) {
        throw new Error('No active location found');
      }

      let error;
      let variantId = variant?.id;

      if (variant?.id) {
        // Update existing variant
        const { error: updateError } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', variant.id);
        error = updateError;
      } else {
        // Create new variant
        const { data: insertData, error: insertError } = await supabase
          .from('product_variants')
          .insert([{
            ...variantData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        error = insertError;
        variantId = insertData?.id;
      }

      if (error) throw error;

      // Update or create inventory record
      const { error: inventoryError } = await supabase
        .from('inventory')
        .upsert({
          location_id: defaultLocation.id,
          product_variant_id: variantId,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          in_stock: formData.in_stock,
          updated_at: new Date().toISOString()
        });

      if (inventoryError) throw inventoryError;

      toast.success(variant?.id ? 'Variant updated successfully' : 'Variant created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save variant';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {variant ? 'Edit Product Variant' : 'Add New Product Variant'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Size Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size Name *
                </label>
                <input
                  type="text"
                  value={formData.size_name}
                  onChange={(e) => setFormData({ ...formData, size_name: e.target.value })}
                  placeholder="e.g., XS, 140×200, King"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Size Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size Type *
                </label>
                <select
                  value={formData.size_type}
                  onChange={(e) => setFormData({ ...formData, size_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {sizeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              {/* Height (mainly for pillows) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm) {formData.size_type === 'pillow' && '*'}
                </label>
                <input
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                  placeholder="e.g., 14"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  step="0.1"
                  required={formData.size_type === 'pillow'}
                />
              </div>

              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (cm) {(formData.size_type === 'mattress' || formData.size_type === 'bed') && '*'}
                </label>
                <input
                  type="number"
                  value={formData.width_cm}
                  onChange={(e) => setFormData({ ...formData, width_cm: e.target.value })}
                  placeholder="e.g., 140"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  step="0.1"
                  required={formData.size_type === 'mattress' || formData.size_type === 'bed'}
                />
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (cm) {(formData.size_type === 'mattress' || formData.size_type === 'bed') && '*'}
                </label>
                <input
                  type="number"
                  value={formData.length_cm}
                  onChange={(e) => setFormData({ ...formData, length_cm: e.target.value })}
                  placeholder="e.g., 200"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  step="0.1"
                  required={formData.size_type === 'mattress' || formData.size_type === 'bed'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 5999"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Old Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Price (Optional)
                </label>
                <input
                  type="number"
                  value={formData.old_price}
                  onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                  placeholder="e.g., 7999"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center">
              {/* In Stock */}
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 mr-2"
                />
                <label htmlFor="in_stock" className="text-sm font-medium text-gray-700">
                  In Stock
                </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : variant ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductVariantForm;