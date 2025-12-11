import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Review {
  id?: string;
  username: string;
  description?: string;
  image_url: string;
  type: 'image' | 'video';
  instagram_url?: string;
  order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: Review;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, review, onSuccess }) => {
  const [formData, setFormData] = useState<Review>({
    username: '',
    description: '',
    image_url: '',
    type: 'image',
    instagram_url: '',
    order: 0,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (review) {
      setFormData({
        id: review.id,
        username: review.username || '',
        description: review.description || '',
        image_url: review.image_url || '',
        type: review.type || 'image',
        instagram_url: review.instagram_url || '',
        order: review.order || 0,
        active: review.active ?? true
      });
    } else {
      setFormData({
        username: '',
        description: '',
        image_url: '',
        type: 'image',
        instagram_url: '',
        order: 0,
        active: true
      });
    }
  }, [review, isOpen]);

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

      if (review?.id) {
        // Update existing review
        const { error: updateError } = await supabase
          .from('customer_reviews')
          .update(dataToSend)
          .eq('id', review.id);
        error = updateError;
      } else {
        // Create new review
        const { error: insertError } = await supabase
          .from('customer_reviews')
          .insert([{
            ...dataToSend,
            created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(review?.id ? 'Review updated successfully' : 'Review created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save review';
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
            {review ? 'Edit Review' : 'Add New Review'}
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
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., info-images/example.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'image' | 'video' })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            {formData.type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://www.instagram.com/reel/..."
                />
              </div>
            )}

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
              className="px-4 py-2 bg-brand-turquoise text-white hover:bg-brand-navy disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : review ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;