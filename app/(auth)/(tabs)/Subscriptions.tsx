import React, { useMemo, useState } from 'react'
import { View, Text, FlatList, TextInput, Image, Pressable } from 'react-native'
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import { icons } from '@/constants/icons';

const SafeAreaView = styled(RNSafeAreaView)

const Subscriptions = () => {
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const subscriptions = useSubscriptionStore((s) => s.subscriptions)
  const removeSubscription = useSubscriptionStore((s) => s.removeSubscription)
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription)
  const addSubscription = useSubscriptionStore((s) => s.addSubscription)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return subscriptions
    return subscriptions.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q) ||
        (s.plan || '').toLowerCase().includes(q)
      )
    })
  }, [query, subscriptions])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5">
        <Text className="text-4xl font-sans-bold text-primary mb-3">Subscriptions</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search subscriptions by name, category or plan"
          className="  px-4 py-3 text-base text-primary font-sans-extrabold"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="p-5 flex-row items-center justify-between">
        <Text className="text-4xl font-sans-bold text-primary">Subscriptions</Text>
        <Pressable onPress={() => { setEditing(null); setShowCreateModal(true); }} className="w-14 h-14 rounded-full items-center justify-center bg-black">
          <Image source={icons.plus} className="w-6 h-6" style={{ tintColor: 'white' }} />
        </Pressable>
      </View>

      <CreateSubscriptionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(s) => { addSubscription(s); setShowCreateModal(false); }}
        initialData={editing ?? undefined}
        onUpdate={(s) => { updateSubscription(s.id, s); setShowCreateModal(false); setEditing(null); }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
            onEdit={() => { setEditing(item); setShowCreateModal(true); }}
            onRemove={() => removeSubscription(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
        ListEmptyComponent={() => (
          <Text className="text-center text-sm text-muted-foreground mt-6">No subscriptions found</Text>
        )}
      />
    </SafeAreaView>
  )
}

export default Subscriptions