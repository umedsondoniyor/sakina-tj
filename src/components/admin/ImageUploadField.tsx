import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
  required = false,
  className = ""
}) => {
  const [previewError, setPreviewError] = useState(false);

  const handleImageError = () => {
    setPreviewError(true);
  };

  const handleImageLoad = () => {
    setPreviewError(false);
  };

  const clearImage = () => {
    onChange('');
    setPreviewError(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="space-y-3">
        {/* URL Input */}
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Image Preview */}
        {value && (
          <div className="relative">
            <div className="w-full max-w-xs border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {!previewError ? (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">Не удалось загрузить изображение</p>
                  </div>
                </div>
              )}
            </div>
            
            {!previewError && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded text-white hover:bg-opacity-70 transition-colors"
                title="Открыть в новой вкладке"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {/* Upload Instructions */}
        <div className="text-xs text-gray-500">
          <p>Рекомендуемые размеры:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Герой: 1200×630px для лучшего отображения</li>
            <li>Команда: 400×400px (квадратные фото)</li>
            <li>Формат: JPG, PNG, WebP</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;