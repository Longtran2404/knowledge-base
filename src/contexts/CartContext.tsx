/**
 * Cart Context - Quản lý state giỏ hàng
 * Hỗ trợ đồng bộ với Supabase và localStorage
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, Product, Course } from "../lib/supabase-config";
import { supabase } from "../lib/supabase-config";
import { useAuth } from "./UnifiedAuthContext";

// Types
export interface CartItemWithDetails extends CartItem {
  product?: Product;
  course?: Course;
  name: string;
  image_url?: string;
}

export interface CartState {
  items: CartItemWithDetails[];
  total: number;
  count: number;
  isLoading: boolean;
  error: string | null;
}

export interface CartContextType extends CartState {
  addToCart: (item: {
    product_id?: string;
    course_id?: string;
    item_type: "product" | "course";
    price: number;
    name: string;
    image_url?: string;
  }) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Action types
type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ITEMS"; payload: CartItemWithDetails[] }
  | { type: "ADD_ITEM"; payload: CartItemWithDetails }
  | { type: "UPDATE_ITEM"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" };

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  count: 0,
  isLoading: false,
  error: null,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_ITEMS":
      const total = action.payload.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const count = action.payload.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return {
        ...state,
        items: action.payload,
        total,
        count,
        error: null,
      };

    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) =>
          (action.payload.product_id &&
            item.product_id === action.payload.product_id) ||
          (action.payload.course_id &&
            item.course_id === action.payload.course_id)
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        const total = updatedItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
        const count = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return { ...state, items: updatedItems, total, count };
      } else {
        const newItems = [...state.items, action.payload];
        const total = newItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
        const count = newItems.reduce((sum, item) => sum + item.quantity, 0);
        return { ...state, items: newItems, total, count };
      }
    }

    case "UPDATE_ITEM": {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0);
      const total = updatedItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const count = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      return { ...state, items: updatedItems, total, count };
    }

    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
      );
      const totalAfterRemove = filteredItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const countAfterRemove = filteredItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return {
        ...state,
        items: filteredItems,
        total: totalAfterRemove,
        count: countAfterRemove,
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [], total: 0, count: 0 };

    default:
      return state;
  }
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  const syncCart = useCallback(async () => {
    if (!user) return;

    // Temporarily disable cart loading to avoid 404 errors
    console.log("Cart loading disabled - database tables not set up");
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_ITEMS", payload: [] });
    
    /* TODO: Re-enable when database tables are set up
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Load cart from Supabase
      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Transform data
      const itemsWithDetails: CartItemWithDetails[] = (cartItems || []).map(
        (item) => ({
          ...(item as any),
          name:
            (item as any).product?.name ||
            (item as any).course?.title ||
            "Unknown Item",
          image_url:
            (item as any).product?.image_url || (item as any).course?.image_url,
          product: (item as any).product,
          course: (item as any).course,
        })
      );

      dispatch({ type: "SET_ITEMS", payload: itemsWithDetails });
    } catch (error) {
      console.error("Error syncing cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Không thể đồng bộ giỏ hàng" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
    */
  }, [user]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          dispatch({ type: "SET_ITEMS", payload: cartData });
        }
      } catch (error) {
        console.error("Error loading cart from storage:", error);
      }
    };

    loadCartFromStorage();
  }, []);

  // Sync cart with Supabase when user logs in
  useEffect(() => {
    if (user) {
      syncCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: "CLEAR_CART" });
    }
  }, [user, syncCart]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    } else {
      localStorage.removeItem("cart");
    }
  }, [state.items]);

  // API Functions
  const addToCart = async (item: {
    product_id?: string;
    course_id?: string;
    item_type: "product" | "course";
    price: number;
    name: string;
    image_url?: string;
  }) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (user) {
        // Sync with Supabase
        const { data, error } = await supabase
          .from("cart_items")
          .upsert({
            user_id: user.id,
            product_id: item.product_id,
            course_id: item.course_id,
            item_type: item.item_type,
            quantity: 1,
            price: item.price,
          } as any)
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        const cartItem: CartItemWithDetails = {
          ...((data as any) || {}),
          name: item.name,
          image_url: item.image_url,
        };

        dispatch({ type: "ADD_ITEM", payload: cartItem });
      } else {
        // Add to local state only
        const cartItem: CartItemWithDetails = {
          id: `temp_${Date.now()}`,
          user_id: "",
          product_id: item.product_id,
          course_id: item.course_id,
          item_type: item.item_type,
          quantity: 1,
          price: item.price,
          name: item.name,
          image_url: item.image_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        dispatch({ type: "ADD_ITEM", payload: cartItem });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Không thể thêm vào giỏ hàng" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      if (user) {
        // Remove from Supabase
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", itemId);

        if (error) throw error;
      }

      // Remove from local state
      dispatch({ type: "REMOVE_ITEM", payload: itemId });
    } catch (error) {
      console.error("Error removing from cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Không thể xóa khỏi giỏ hàng" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      if (user) {
        // Update in Supabase
        const { error } = await (supabase as any)
          .from("cart_items")
          .update({ quantity: quantity })
          .eq("id", itemId);

        if (error) throw error;
      }

      // Update local state
      dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, quantity } });
    } catch (error) {
      console.error("Error updating quantity:", error);
      dispatch({ type: "SET_ERROR", payload: "Không thể cập nhật số lượng" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      if (user) {
        // Clear from Supabase
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id);

        if (error) throw error;
      }

      // Clear local state
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      dispatch({ type: "SET_ERROR", payload: "Không thể xóa giỏ hàng" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const refreshCart = async () => {
    await syncCart();
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
