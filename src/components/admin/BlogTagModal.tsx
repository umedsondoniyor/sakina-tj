import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import type { BlogTag } from '../../lib/types';
import { generateSlug } from '../../lib/blogApi';

interface BlogTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: BlogTag | null;
  onSuccess: () => void;
}

const colorOptions = [
  { value: '#0fb6c9', label: 'Turquoise' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Yellow' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#ef4444', label: 'Red' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#f97316', label: 'Orange' }
];

const BlogTagModal: React.FC<BlogTagModalProps> = ({
  isOpen,
  onClose,
  tag,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#0fb6c9',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        is_active: tag.is_active
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        color: '#0fb6c9',
        is_active: true
      });
    }
  }, [tag, isOpen]);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: tag ? prev.slug : generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      const tagData = {
        name: formData.name.trim(),
        slug: formData.slug || generateSlug(formData.name),
        color: formData.color,
        is_active: formData.is_active
      };

      if (tag?.id) {
        const { error } = await supabase
          .from('blog_tags')
          .update(tagData)
          .eq('id', tag.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_tags')
          .insert([tagData]);

        if (error) throw error;
      }

      toast.success(tag?.id ? 'Tag updated successfully' : 'Tag created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save tag');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {tag ? 'Edit Tag' : 'Create Tag'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tag name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    formData.color === color.value ? 'border-gray-900 scale-105' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded text-blue-600 focus:ring-blue-500 mr-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : tag ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogTagModal;