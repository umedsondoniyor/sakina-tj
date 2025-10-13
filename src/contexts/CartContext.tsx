
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, CartContextType } from '../lib/types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate total whenever items change
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => 
        item.id === newItem.id && item.size === newItem.size
      );

      if (existingItem) {
        return currentItems.map(item =>
          item.id === newItem.id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      return [...currentItems, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      setIsOpen,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};