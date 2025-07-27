import React from 'react';
import { Play } from 'lucide-react';

const ManufacturingProcess = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="relative">
        <div className="aspect-[21/9] md:aspect-[21/9] rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=80"
            alt="Manufacturing Process"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors group">
              <Play size={32} className="text-white ml-1.5 md:ml-2" />
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 text-white">
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">Создание наших матрасов</h2>
          <p className="text-white/80 text-sm md:text-base max-w-xl">
            Заглянем за кулисы производственных цехов компании Askona, чтобы узнать, откуда берется качество
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingProcess;