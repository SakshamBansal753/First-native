import "@/global.css";
import dayjs from "dayjs";
import { Image, Text, View, FlatList, Pressable } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import images from "@/constants/images";
import { icons } from '@/constants/icons';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptions from "@/components/UpcomingSubscriptions";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import { useEffect, useState } from "react";
import { useSubscriptionStore } from '@/lib/subscriptionStore';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscription, setexpandedSubscription] = useState<string | null>(null);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const displayName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ''}${user?.lastName ? ` ${user.lastName}` : ''}`.trim()
      : user?.primaryEmailAddress?.emailAddress
      ? user.primaryEmailAddress.emailAddress.split('@')[0]
      : 'Subscriber';

  const profilePhotoUrl = user?.imageUrl;

  useEffect(() => {
    if (!user) {
      return;
    }

    const profilePhotoKey = `profilePhotoUri_${user.id}`;
    const loadLocalPhoto = async () => {
      const storedUri = await SecureStore.getItemAsync(profilePhotoKey);
      if (storedUri) {
        setLocalPhotoUri(storedUri);
      }
    };

    loadLocalPhoto();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/Sign-in');
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  const handleCreate = (newSub: any) => {
    addSubscription(newSub);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <CreateSubscriptionModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={localPhotoUri ? { uri: localPhotoUri } : profilePhotoUrl ? { uri: profilePhotoUrl } : images.avatar}
                  className="home-avatar"
                />
                <View>
                  <Text className="home-user-name">{displayName}</Text>
                  <Text className="text-sm font-sans-medium pl-4 text-muted-foreground">Welcome back</Text>
                </View>
              </View>
              <View className="home-header-actions">
                <Pressable onPress={() => setShowCreateModal(true)} className="rounded-full bg-white/90 px-3 py-2 mr-2">
                  <Image source={icons.add} className="w-5 h-5" />
                </Pressable>
                <Pressable
                  onPress={handleSignOut}
                  className="rounded-full bg-white/90 px-4 py-2 shadow-sm shadow-black/5"
                >
                  <Text className="text-sm font-sans-semibold text-primary">Sign out</Text>
                </Pressable>
              </View>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                </Text>
              </View>
            </View>
            <View>
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptions {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                ListEmptyComponent={<Text className="home-empty-state">No Upcoming subscriptions</Text>}
              />
            </View>
            <View className="mt-5 rounded-4xl border border-black/10 bg-white p-5 shadow-sm shadow-black/5">
              <Text className="mb-2 text-base font-sans-semibold text-primary">Account</Text>
              <Text className="mb-4 text-sm text-muted-foreground">
                Use this button to sign out of the app and return to the login screen.
              </Text>
              <Pressable
                onPress={handleSignOut}
                className="rounded-3xl bg-accent px-5 py-4 items-center justify-center"
              >
                <Text className="text-base font-sans-semibold text-white">Log out</Text>
              </Pressable>
            </View>
            <ListHeading title="All subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscription === item.id}
            onPress={() =>
              setexpandedSubscription((currentId) =>
                currentId === item.id ? null : item.id
              )
            }
          />
        )}
        extraData={expandedSubscription}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscription yet</Text>
        }
        contentContainerStyle={{ paddingBottom: 200 }}
      />
    </SafeAreaView>
  );
}
