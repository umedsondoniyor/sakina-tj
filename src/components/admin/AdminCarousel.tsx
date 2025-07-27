import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Trash2, Plus, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import CarouselModal from './CarouselModal';

interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  order: number;
  active: boolean;
}

const AdminCarousel = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | undefined>();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load carousel slides');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSlides(slides.filter(slide => slide.id !== id));
      toast.success('Slide deleted successfully');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const toggleActive = async (slide: CarouselSlide) => {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .update({ active: !slide.active })
        .eq('id', slide.id);

      if (error) throw error;
      
      setSlides(slides.map(s => 
        s.id === slide.id ? { ...s, active: !s.active } : s
      ));
      toast.success(`Slide ${slide.active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling slide status:', error);
      toast.error('Failed to update slide status');
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSlide(undefined);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Carousel Management</h1>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Slide
          </button>
        </div>
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No slides found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new slide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carousel Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{slide.title}</h3>
              {slide.subtitle && (
                <p className="text-gray-600 text-sm mb-4">{slide.subtitle}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Order: {slide.order}</span>
                  <button
                    onClick={() => toggleActive(slide)}
                    className={`px-2 py-1 rounded text-xs ${
                      slide.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {slide.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
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

      <CarouselModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slide={selectedSlide}
        onSuccess={fetchSlides}
      />
    </div>
  );
};

export default AdminCarousel;