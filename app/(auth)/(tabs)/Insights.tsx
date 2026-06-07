import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/expo';

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const balance = useSubscriptionStore((s) => s.balance);
  const balanceHistory = useSubscriptionStore((s) => s.balanceHistory);
  const loadUserState = useSubscriptionStore((s) => s.loadUserState);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    loadUserState(user.id);
  }, [user, loadUserState]);

  const monthlyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    subscriptions.forEach((s) => {
      const month = s.startDate ? s.startDate.slice(0, 7) : 'unknown';
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  }, [subscriptions]);

  const graphItems = useMemo(() => {
    const maxCount = Math.max(1, ...monthlyCounts.map(([, count]) => count));
    return monthlyCounts.map(([month, count], index) => ({
      month,
      count,
      height: Math.max(24, (count / maxCount) * 180),
      x: index * 52 + 16,
    }));
  }, [monthlyCounts]);

  const cannotAfford = useMemo(() => subscriptions.filter((item) => item.price > balance), [subscriptions, balance]);

  return (
    <SafeAreaView className="flex-1 bg-zinc-950 p-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-sans-bold text-white mb-5">Insights</Text>

        <View className="rounded-4xl bg-zinc-900 border border-white/10 p-5 mb-5">
          <Text className="text-sm uppercase tracking-[0.2em] text-zinc-400 mb-3">Current overview</Text>
          <Text className="text-3xl font-sans-semibold text-white">{formatCurrency(balance)}</Text>
          <Text className="mt-2 text-sm text-zinc-400">Your balance is synced globally across logins.</Text>
          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-3xl bg-white/5 p-4">
              <Text className="text-xs uppercase tracking-[0.18em] text-zinc-400">Active subscriptions</Text>
              <Text className="mt-3 text-2xl font-sans-semibold text-white">{subscriptions.length}</Text>
            </View>
            <View className="flex-1 rounded-3xl bg-white/5 p-4">
              <Text className="text-xs uppercase tracking-[0.18em] text-zinc-400">At risk</Text>
              <Text className="mt-3 text-2xl font-sans-semibold text-white">{cannotAfford.length}</Text>
            </View>
          </View>
        </View>

        <View className="rounded-4xl bg-zinc-900 border border-white/10 p-5 mb-5">
          <Text className="text-base font-sans-semibold text-white mb-4">Monthly subscription trend</Text>
          <View className="relative h-64 rounded-4xl bg-zinc-950/95 p-4">
            <View className="absolute inset-x-0 top-16 h-px bg-white/10" />
            <View className="absolute inset-x-0 top-32 h-px bg-white/10" />
            <View className="absolute inset-x-0 top-48 h-px bg-white/10" />
            <View className="absolute inset-x-0 top-64 h-px bg-white/10" />

            <View className="flex-row items-end justify-between h-full">
              {graphItems.map((item) => (
                <View key={item.month} className="items-center" style={{ width: 48 }}>
                  <View className="flex-1 justify-end">
                    <View className="rounded-full bg-amber-400" style={{ width: 22, height: item.height }} />
                  </View>
                  <Text className="mt-3 text-xs text-zinc-400">{item.month.slice(5)}</Text>
                </View>
              ))}
            </View>

            <View style={{ position: 'absolute', top: 0, left: 0, width: graphItems.length * 52, height: 240 }}>
              {graphItems.slice(1).map((item, index) => {
                const prev = graphItems[index];
                const x1 = prev.x;
                const y1 = 214 - prev.height;
                const x2 = item.x;
                const y2 = 214 - item.height;
                const dx = x2 - x1;
                const dy = y2 - y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

                return (
                  <View
                    key={`${prev.month}-${item.month}`}
                    style={{
                      position: 'absolute',
                      left: x1,
                      top: y1,
                      width: length,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: '#facc15',
                      transform: [{ rotate: `${angle}deg` }],
                    }}
                  />
                );
              })}
              {graphItems.map((item) => (
                <View
                  key={`dot-${item.month}`}
                  style={{
                    position: 'absolute',
                    left: item.x - 6,
                    top: 214 - item.height - 6,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#facc15',
                    borderWidth: 2,
                    borderColor: '#0f172a',
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        <View className="rounded-4xl bg-zinc-900 border border-white/10 p-5 mb-5">
          <Text className="text-base font-sans-semibold text-white mb-4">Affordability alerts</Text>
          {cannotAfford.length ? (
            cannotAfford.map((item) => (
              <View key={item.id} className="rounded-3xl bg-black/40 p-4 mb-3">
                <Text className="text-sm text-zinc-400">Too expensive</Text>
                <Text className="mt-1 text-white font-sans-semibold">{item.name}</Text>
                <Text className="text-sm text-amber-300">{formatCurrency(item.price, item.currency ?? 'INR')}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-zinc-400">Your current balance covers all subscriptions.</Text>
          )}
        </View>

        <View className="rounded-4xl bg-zinc-900 border border-white/10 p-5 mb-5">
          <Text className="text-base font-sans-semibold text-white mb-4">Balance history</Text>
          {balanceHistory.length ? (
            balanceHistory.slice(-6).reverse().map((entry) => (
              <View key={entry.ts} className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-zinc-400">{new Date(entry.ts).toLocaleDateString()}</Text>
                <Text className="text-sm text-white">{formatCurrency(entry.balance)}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-zinc-400">No balance updates saved yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
