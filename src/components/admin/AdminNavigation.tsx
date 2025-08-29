import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import NavigationItemModal from './NavigationItemModal';
import type { NavigationItem } from '../../lib/types';

const AdminNavigation = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NavigationItem | undefined>();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
      toast.error('Failed to load navigation items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) return;

    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItems(items.filter(item => item.id !== id));
      toast.success('Navigation item deleted successfully');
    } catch (error) {
      console.error('Error deleting navigation item:', error);
      toast.error('Failed to delete navigation item');
    }
  };

  const toggleActive = async (item: NavigationItem) => {
    try {
      const { error } = await supabase
        .from('navigation_items')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;
      
      setItems(items.map(i => 
        i.id === item.id ? { ...i, is_active: !i.is_active } : i
      ));
      toast.success(`Navigation item ${item.is_active ? 'hidden' : 'shown'} successfully`);
    } catch (error) {
      console.error('Error toggling navigation item status:', error);
      toast.error('Failed to update navigation item status');
    }
  };

  const moveItem = async (itemId: string, direction: 'up' | 'down') => {
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    try {
      const item1 = items[itemIndex];
      const item2 = items[newIndex];

      // Swap order_index values
      await Promise.all([
        supabase
          .from('navigation_items')
          .update({ order_index: item2.order_index })
          .eq('id', item1.id),
        supabase
          .from('navigation_items')
          .update({ order_index: item1.order_index })
          .eq('id', item2.id)
      ]);

      // Update local state
      const newItems = [...items];
      [newItems[itemIndex], newItems[newIndex]] = [newItems[newIndex], newItems[itemIndex]];
      setItems(newItems);

      toast.success('Navigation order updated successfully');
    } catch (error) {
      console.error('Error updating navigation order:', error);
      toast.error('Failed to update navigation order');
    }
  };

  const handleEdit = (item: NavigationItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Navigation Menu Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No navigation items found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new menu item.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow border p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Icon Preview */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.icon_image_url ? (
                      <img
                        src={item.icon_image_url}
                        alt={item.title}
                        className="w-8 h-8"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">{item.icon_name || 'Icon'}</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      Category: {item.category_slug} • Order: {item.order_index}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => toggleActive(item)}
                    className={`flex items-center px-3 py-1 rounded-full text-sm ${
                      item.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.is_active ? <Eye size={14} className="mr-1" /> : <EyeOff size={14} className="mr-1" />}
                    {item.is_active ? 'Visible' : 'Hidden'}
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveItem(item.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveItem(item.id, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NavigationItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSuccess={fetchItems}
      />
    </div>
  );
};

export default AdminNavigation;