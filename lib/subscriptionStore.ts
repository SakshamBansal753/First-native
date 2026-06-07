import { create } from 'zustand';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'user_subscriptions_v1';

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: (subscription) =>
    set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
  updateSubscription: (id, updates) =>
    set((state) => ({ subscriptions: state.subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s)) })),
  removeSubscription: (id) =>
    set((state) => ({ subscriptions: state.subscriptions.filter((s) => s.id !== id) })),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
}));

// Load persisted user subscriptions and subscribe to changes
(async () => {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      const userSubs = JSON.parse(raw) as Subscription[];
      if (userSubs && userSubs.length) {
        useSubscriptionStore.setState({ subscriptions: [...userSubs, ...HOME_SUBSCRIPTIONS] });
      }
    }
  } catch (e) {
    console.warn('Failed to load subscriptions', e);
  }
})();

useSubscriptionStore.subscribe((state) => state.subscriptions, (subs) => {
  try {
    const userSubs = subs.filter((s) => s.userCreated);
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(userSubs));
  } catch (e) {
    console.warn('Failed to save subscriptions', e);
  }
});
