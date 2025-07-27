import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface ProductFormProps {
  onSuccess: () => void;
  onClose: () => void;
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    old_price?: number;
    category: string;
    image_urls: string[];
  };
}

const categories = [
  { value: 'mattresses', label: 'Матрасы' },
  { value: 'beds', label: 'Кровати' },
  { value: 'smartchair', label: 'Массажное кресло' },
  { value: 'map', label: 'Карта' },
  { value: 'pillows', label: 'Подушки' },
  { value: 'blankets', label: 'Одеяла' },
  { value: 'furniture', label: 'Мебель' },
];

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    old_price: initialData?.old_price || 0,
    category: initialData?.category || 'mattresses',
    image_urls: initialData?.image_urls || ['']
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'old_price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...formData.image_urls];
    newImageUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      image_urls: newImageUrls
    }));
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, '']
    }));
  };

  const removeImageUrl = (index: number) => {
    if (formData.image_urls.length > 1) {
      setFormData(prev => ({
        ...prev,
        image_urls: prev.image_urls.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Filter out empty image URLs
      const filteredImageUrls = formData.image_urls.filter(url => url.trim() !== '');
      
      if (filteredImageUrls.length === 0) {
        setError('At least one image URL is required');
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Validate price format
      if (isNaN(formData.price) || formData.price <= 0) {
        setError('Please enter a valid price');
        setSubmitting(false);
        return;
      }

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to continue');
      }

      const productData = {
        ...formData,
        image_urls: filteredImageUrls,
        updated_at: new Date().toISOString()
      };

      let error;
      
      if (initialData?.id) {
        const { data: updateData, error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        error = updateError;
        
        if (updateError) {
          throw new Error('Failed to update product');
        }
        
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }]);

        error = insertError;
        
        if (error) {
          throw new Error('Failed to create product');
        }
      }

      if (error) throw error;

      toast.success(initialData?.id ? 'Product updated successfully' : 'Product created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save product';
      console.error('Error saving product:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Price (Optional)
                </label>
                <input
                  type="number"
                  name="old_price"
                  min="0"
                  step="0.01"
                  value={formData.old_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Product Images
                </label>
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Image
                </button>
              </div>
              <div className="space-y-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {formData.image_urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
              disabled={submitting}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400"
            >
              {submitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;