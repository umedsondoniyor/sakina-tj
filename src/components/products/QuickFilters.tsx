import React from 'react';

const QuickFilters = () => {
  return (
    <div className="relative mb-6">
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex space-x-3 min-w-max">
          <button className="flex-none px-4 py-2 bg-yellow-100 rounded-full text-sm whitespace-nowrap">
            Онлайн-подбор матраса
          </button>
          <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
            Матрас 160×200
          </button>
          <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
            Матрас 180×200
          </button>
          <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
            Матрас 140×200
          </button>
          <button className="flex-none px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 whitespace-nowrap">
            Матрас 90×200
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;