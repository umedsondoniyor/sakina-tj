import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartModal: React.FC = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">В корзине {items.length} {items.length === 1 ? 'товар' : 'товара'}</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="font-medium mb-1">{item.name}</h3>
                {item.size && (
                  <p className="text-sm text-gray-600 mb-1">{item.size}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold">{item.price.toLocaleString()} ₽</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Итого</span>
            <span>{total.toLocaleString()} ₽</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors"
          >
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;