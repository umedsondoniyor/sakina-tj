// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, CartContextType, CartItemMatchOptions } from '../lib/types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sakina_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart:', e);
        localStorage.removeItem('sakina_cart');
      }
    }
  }, []);

  // Persist to localStorage on change and recalculate totals
  useEffect(() => {
    localStorage.setItem('sakina_cart', JSON.stringify(items));

    // Recalculate totals
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newCount = items.reduce((sum, item) => sum + item.quantity, 0);

    setTotal(newTotal);
    setTotalItems(newCount);
  }, [items]);


  const isSameCartLine = (
    item: CartItem,
    id: string,
    options?: CartItemMatchOptions
  ) => {
    if (options?.variantId) {
      return item.id === id && item.variant_id === options.variantId;
    }
    if (options?.size) {
      return item.id === id && item.size === options.size;
    }
    return item.id === id;
  };

  const addItem = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item =>
        isSameCartLine(item, newItem.id, {
          variantId: newItem.variant_id,
          size: newItem.size,
        })
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

  const removeItem = (id: string, options?: CartItemMatchOptions) => {
    setItems(currentItems =>
      currentItems.filter(item => !isSameCartLine(item, id, options))
    );
  };

  const updateQuantity = (id: string, quantity: number, options?: CartItemMatchOptions) => {
    if (quantity < 1) return;
    setItems(currentItems =>
      currentItems.map(item =>
        isSameCartLine(item, id, options)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        total,
        totalItems,
      }}
    >
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
