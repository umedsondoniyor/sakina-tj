import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { NavigationItem } from '../../lib/types';

interface NavigationItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: NavigationItem;
  onSuccess: () => void;
}

const availableIcons = [
  'BedDouble',
  'Sofa', 
  'RockingChair',
  'Earth',
  'Users',
  'Package',
  'Home',
  'ShoppingCart',
  'Heart',
  'Star'
];

const NavigationItemModal: React.FC<NavigationItemModalProps> = ({ 
  isOpen, 
  onClose, 
  item, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category_slug: '',
    icon_name: '',
    icon_image_url: '',
    order_index: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        category_slug: item.category_slug,
        icon_name: item.icon_name || '',
        icon_image_url: item.icon_image_url || '',
        order_index: item.order_index,
        is_active: item.is_active
      });
    } else {
      setFormData({
        title: '',
        category_slug: '',
        icon_name: '',
        icon_image_url: '',
        order_index: 0,
        is_active: true
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.category_slug) {
        throw new Error('Title and category slug are required');
      }

      const dataToSend = {
        ...formData,
        icon_name: formData.icon_name || null,
        icon_image_url: formData.icon_image_url || null,
        updated_at: new Date().toISOString()
      };

      let error;

      if (item?.id) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('navigation_items')
          .update(dataToSend)
          .eq('id', item.id);
        error = updateError;
      } else {
        // Create new item
        const { error: insertError } = await supabase
          .from('navigation_items')
          .insert([{
            ...dataToSend,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(item?.id ? 'Navigation item updated successfully' : 'Navigation item created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving navigation item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save navigation item';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {item ? 'Edit Navigation Item' : 'Add New Navigation Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Матрасы"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Slug *
              </label>
              <input
                type="text"
                required
                value={formData.category_slug}
                onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                placeholder="e.g., mattresses, beds, about"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use 'about' for About page, or product categories like 'mattresses', 'beds', etc.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lucide Icon Name
                </label>
                <select
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select an icon</option>
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Icon URL
                </label>
                <input
                  type="text"
                  value={formData.icon_image_url}
                  onChange={(e) => setFormData({ ...formData, icon_image_url: e.target.value })}
                  placeholder="/icons/custom-icon.png"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Use either a Lucide icon name OR a custom icon URL, not both.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Visible in menu
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
              {loading ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NavigationItemModal;