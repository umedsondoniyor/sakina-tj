import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewModal from './ReviewModal';

interface Review {
  id: string;
  username: string;
  description?: string;
  image_url: string;
  type: 'image' | 'video';
  instagram_url?: string;
  order: number;
  active: boolean;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | undefined>();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReviews(reviews.filter(review => review.id !== id));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const toggleActive = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .update({ active: !review.active })
        .eq('id', review.id);

      if (error) throw error;
      
      setReviews(reviews.map(r => 
        r.id === review.id ? { ...r, active: !r.active } : r
      ));
      toast.success(`Review ${review.active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling review status:', error);
      toast.error('Failed to update review status');
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedReview(undefined);
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
        <h1 className="text-2xl font-bold">Customer Reviews Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="relative">
              <img
                src={review.image_url}
                alt={review.username}
                className="w-full h-48 object-cover"
              />
              {review.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <Play size={36} className="text-white" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{review.username}</h3>
              {review.description && (
                <p className="text-gray-600 text-sm mb-4">{review.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Order: {review.order}</span>
                  <button
                    onClick={() => toggleActive(review)}
                    className={`px-2 py-1 rounded text-xs ${
                      review.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {review.active ? 'Active' : 'Inactive'}
                  </button>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {review.type}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={selectedReview}
        onSuccess={fetchReviews}
      />
    </div>
  );
};

export default AdminReviews;