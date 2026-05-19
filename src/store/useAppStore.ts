import { create } from 'zustand';

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  scenario: string;
  timestamp: Date;
  actionType: 'auto_purchase' | 'recommend_only' | 'confirmed';
}

export interface CartItem {
  product: any;
  quantity: number;
}

interface AppState {
  walletBalance: number;
  transactionHistory: Transaction[];
  apiKey: string;
  currentScenario: 'S1' | 'S2' | 'S3' | 'S4';
  budgetLimit: number;
  cart: CartItem[];
  deductFunds: (amount: number, tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  resetWallet: () => void;
  setApiKey: (key: string) => void;
  setCurrentScenario: (scenario: 'S1' | 'S2' | 'S3' | 'S4') => void;
  setBudgetLimit: (limit: number) => void;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addConfirmedTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  walletBalance: 1000.00,
  transactionHistory: [],
  apiKey: '',
  currentScenario: 'S1',
  budgetLimit: 300.00,
  cart: [],

  deductFunds: (amount, tx) =>
    set((state) => ({
      walletBalance: Math.max(0, state.walletBalance - amount),
      transactionHistory: [
        {
          ...tx,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
        ...state.transactionHistory,
      ],
    })),

  addConfirmedTransaction: (tx) =>
    set((state) => ({
      walletBalance: Math.max(0, state.walletBalance - tx.amount),
      transactionHistory: [
        {
          ...tx,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
        ...state.transactionHistory,
      ],
    })),

  resetWallet: () =>
    set({
      walletBalance: 1000.00,
      transactionHistory: [],
      budgetLimit: 300.00,
      cart: [],
    }),

  setApiKey: (key) => set({ apiKey: key }),
  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),
  setBudgetLimit: (limit) => set({ budgetLimit: limit }),
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  clearCart: () => set({ cart: [] }),
}));
