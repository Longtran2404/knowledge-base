import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  type: "course" | "document" | "template" | "ebook";
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  category: string;
  downloadUrl?: string;
  fileSize?: string;
  fileFormat?: string;
  quantity: number;
  addedAt: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  savedAmount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity" | "addedAt"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  savedAmount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(item => item.id === action.payload.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            ...action.payload,
            quantity: 1,
            addedAt: new Date().toISOString(),
          }
        ];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const savedAmount = newItems.reduce((sum, item) => {
        const originalPrice = item.originalPrice || item.price;
        return sum + ((originalPrice - item.price) * item.quantity);
      }, 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        savedAmount,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const savedAmount = newItems.reduce((sum, item) => {
        const originalPrice = item.originalPrice || item.price;
        return sum + ((originalPrice - item.price) * item.quantity);
      }, 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        savedAmount,
      };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const savedAmount = newItems.reduce((sum, item) => {
        const originalPrice = item.originalPrice || item.price;
        return sum + ((originalPrice - item.price) * item.quantity);
      }, 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        savedAmount,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        savedAmount: 0,
      };

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      };

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      };

    case "LOAD_CART": {
      const totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const savedAmount = action.payload.reduce((sum, item) => {
        const originalPrice = item.originalPrice || item.price;
        return sum + ((originalPrice - item.price) * item.quantity);
      }, 0);

      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
        savedAmount,
      };
    }

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity" | "addedAt">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  isInCart: (id: string) => boolean;
  getCartItem: (id: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on init
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("nlc_cart");
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: cartItems });
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("nlc_cart", JSON.stringify(state.items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state.items]);

  const addItem = (item: Omit<CartItem, "quantity" | "addedAt">) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast.success(`Đã thêm "${item.title}" vào giỏ hàng`, {
      duration: 2000,
    });
  };

  const removeItem = (id: string) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: "REMOVE_ITEM", payload: id });
    if (item) {
      toast.success(`Đã xóa "${item.title}" khỏi giỏ hàng`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  const openCart = () => {
    dispatch({ type: "OPEN_CART" });
  };

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const isInCart = (id: string) => {
    return state.items.some(item => item.id === id);
  };

  const getCartItem = (id: string) => {
    return state.items.find(item => item.id === id);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        isInCart,
        getCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}