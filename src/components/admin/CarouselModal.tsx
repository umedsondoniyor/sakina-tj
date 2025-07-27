import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface CarouselSlide {
  id?: string;
  title: string;
  subtitle?: string;
  image_url: string;
  order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide?: CarouselSlide;
  onSuccess: () => void;
}

const CarouselModal: React.FC<CarouselModalProps> = ({ isOpen, onClose, slide, onSuccess }) => {
  const [formData, setFormData] = useState<CarouselSlide>({
    title: '',
    subtitle: '',
    image_url: '',
    order: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (slide) {
      setFormData({
        id: slide.id,
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        image_url: slide.image_url || '',
        order: slide.order || 0,
        active: slide.active ?? true
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        image_url: '',
        order: 0,
        active: true
      });
    }
  }, [slide, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check authentication status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!session) {
        toast.error('Please log in to continue');
        navigate('/admin/login');
        return;
      }

      // Verify admin role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new Error(`Profile error: ${profileError.message}`);
      }

      if (!profile || profile.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      const dataToSend = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      let error;

      if (slide?.id) {
        // Update existing slide
        const { error: updateError } = await supabase
          .from('carousel_slides')
          .update(dataToSend)
          .eq('id', slide.id);
        error = updateError;
      } else {
        // Create new slide
        const { error: insertError } = await supabase
          .from('carousel_slides')
          .insert([{
            ...dataToSend,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(slide?.id ? 'Slide updated successfully' : 'Slide created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving slide:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save slide';
      toast.error(errorMessage);
      
      if (errorMessage.includes('Please log in')) {
        navigate('/admin/login');
      }
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
            {slide ? 'Edit Slide' : 'Add New Slide'}
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
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image(1920x400) URL
              </label>
              <input
                type="text"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                required
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 mr-2"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active
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
              {loading ? 'Saving...' : slide ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarouselModal;