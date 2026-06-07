import { create } from 'zustand';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import * as SecureStore from 'expo-secure-store';

const SUBSCRIBER_KEY = 'user_subscriptions_v1';

interface SubscriptionStore {
  currentUserId?: string;
  subscriptions: Subscription[];
  balance: number;
  balanceHistory: Array<{ ts: string; balance: number }>;
  loadUserState: (userId: string) => Promise<void>;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  setBalance: (balance: number) => void;
  appendBalanceHistory: (entry: { ts: string; balance: number }) => void;
}

const persistSubscriptions = async (userId: string, subscriptions: Subscription[]) => {
  try {
    const userSubs = subscriptions.filter((s) => s.userCreated);
    await SecureStore.setItemAsync(`${SUBSCRIBER_KEY}_${userId}`, JSON.stringify(userSubs));
  } catch (error) {
    console.warn('Failed to persist subscriptions', error);
  }
};

const persistBalance = async (userId: string, balance: number) => {
  try {
    await SecureStore.setItemAsync(`user_balance_${userId}`, String(balance));
  } catch (error) {
    console.warn('Failed to persist balance', error);
  }
};

const persistBalanceHistory = async (userId: string, history: Array<{ ts: string; balance: number }>) => {
  try {
    await SecureStore.setItemAsync(`balance_history_${userId}`, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to persist balance history', error);
  }
};

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  currentUserId: undefined,
  subscriptions: HOME_SUBSCRIPTIONS,
  balance: 0,
  balanceHistory: [],
  loadUserState: async (userId: string) => {
    set({ currentUserId: userId });

    try {
      const rawSubs = await SecureStore.getItemAsync(`${SUBSCRIBER_KEY}_${userId}`);
      const userSubs = rawSubs ? (JSON.parse(rawSubs) as Subscription[]) : [];
      const rawBalance = await SecureStore.getItemAsync(`user_balance_${userId}`);
      const rawHistory = await SecureStore.getItemAsync(`balance_history_${userId}`);

      set({
        subscriptions: userSubs.length ? [...userSubs, ...HOME_SUBSCRIPTIONS] : HOME_SUBSCRIPTIONS,
        balance: rawBalance ? Number(rawBalance) : 0,
        balanceHistory: rawHistory ? JSON.parse(rawHistory) : [],
      });
    } catch (error) {
      console.warn('Failed to load user state', error);
      set({ subscriptions: HOME_SUBSCRIPTIONS, balance: 0, balanceHistory: [] });
    }
  },
  addSubscription: (subscription) => {
    set((state) => {
      const updated = [subscription, ...state.subscriptions];
      if (state.currentUserId) persistSubscriptions(state.currentUserId, updated);
      return { subscriptions: updated };
    });
  },
  updateSubscription: (id, updates) => {
    set((state) => {
      const updated = state.subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s));
      if (state.currentUserId) persistSubscriptions(state.currentUserId, updated);
      return { subscriptions: updated };
    });
  },
  removeSubscription: (id) => {
    set((state) => {
      const updated = state.subscriptions.filter((s) => s.id !== id);
      if (state.currentUserId) persistSubscriptions(state.currentUserId, updated);
      return { subscriptions: updated };
    });
  },
  setBalance: (balance) => {
    set((state) => {
      if (state.currentUserId) persistBalance(state.currentUserId, balance);
      return { balance };
    });
  },
  appendBalanceHistory: (entry) => {
    set((state) => {
      const updated = [...state.balanceHistory, entry];
      if (state.currentUserId) persistBalanceHistory(state.currentUserId, updated);
      return { balanceHistory: updated };
    });
  },
}));
