// App store for global state management
import { create } from 'zustand';

interface AppState {
  // UI State
  isSearchOpen: boolean;
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  
  // Cart State
  cartItems: any[];
  cartTotal: number;
  
  // Search State
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  
  // Actions
  toggleSearch: () => void;
  toggleCart: () => void;
  toggleAuthModal: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  updateCartTotal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isSearchOpen: false,
  isCartOpen: false,
  isAuthModalOpen: false,
  cartItems: [],
  cartTotal: 0,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  // Actions
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  toggleAuthModal: () => set((state) => ({ isAuthModalOpen: !state.isAuthModalOpen })),
  
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSearchResults: (results: any[]) => set({ searchResults: results }),
  setIsSearching: (isSearching: boolean) => set({ isSearching }),
  
  addToCart: (item: any) => {
    const { cartItems } = get();
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      set({
        cartItems: cartItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      });
    } else {
      set({
        cartItems: [...cartItems, { ...item, quantity: 1 }]
      });
    }
    
    get().updateCartTotal();
  },
  
  removeFromCart: (itemId: string) => {
    const { cartItems } = get();
    set({
      cartItems: cartItems.filter(item => item.id !== itemId)
    });
    get().updateCartTotal();
  },
  
  clearCart: () => {
    set({ cartItems: [], cartTotal: 0 });
  },
  
  updateCartTotal: () => {
    const { cartItems } = get();
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    set({ cartTotal: total });
  }
}));
