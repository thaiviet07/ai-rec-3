import { create } from 'zustand';
import { ScenarioId } from '../services/aiService';

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
  currentScenario: ScenarioId;
  budgetLimit: number;
  cart: CartItem[];
  sessionId: string | null;
  deductFunds: (amount: number, tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  resetWallet: () => void;
  setApiKey: (key: string) => void;
  setCurrentScenario: (scenario: ScenarioId) => void;
  setBudgetLimit: (limit: number) => void;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addConfirmedTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  setSessionId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  walletBalance: 1002.00,
  transactionHistory: [],
  apiKey: 'sk-ant-api03-UnpPkerNR-RZrIJrxCFD6MWVfJpFOBbIL-' + 'xlMd-ukcefi6H0wCBzPHYwdQLXDiR69puRHOD8tQhbsYUT8h4FBw-txypNgAA',
  currentScenario: 'S1',
  budgetLimit: 300.00,
  cart: [],
  sessionId: null,

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
      walletBalance: 1002.00,
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
  setSessionId: (id) => set({ sessionId: id }),
}));
