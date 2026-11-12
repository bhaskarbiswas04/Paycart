
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'paycart_cart';

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];

    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter(
      (item) =>
        item &&
        typeof item._id === 'string' &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isInteger(item.pricePaise) &&
        item.pricePaise >= 0 &&
        Number.isInteger(item.stock) &&
        item.stock >= 0
    ).map((item) => ({
      ...item,
      quantity: Math.min(item.quantity, item.stock),
    })).filter((item) => item.quantity > 0);
  } catch {
    return [];
  }
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const product = action.payload;

      const existingItem = state.find(
        (item) => item._id === product._id
      );

      if (product.stock < 1) return state;

      if (existingItem) {
        return state.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  item.stock
                ),
              }
            : item
        );
      }

      return [
        ...state,
        {
          _id: product._id,
          name: product.name,
          pricePaise: product.pricePaise,
          images: product.images || [],
          category: product.category,
          stock: product.stock,
          quantity: 1,
        },
      ];
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;

      return state.map((item) => {
        if (item._id !== productId) return item;

        return {
          ...item,
          quantity: Math.max(
            1,
            Math.min(quantity, item.stock)
          ),
        };
      });
    }

    case 'REMOVE_ITEM':
      return state.filter(
        (item) => item._id !== action.payload
      );

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(
    cartReducer,
    undefined,
    getInitialCart
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, quantity },
    });
  };

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotalPaise = cartItems.reduce(
    (total, item) =>
      total + item.pricePaise * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotalPaise,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
};