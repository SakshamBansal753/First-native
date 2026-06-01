import "@/global.css";
import dayjs from "dayjs";
import { Image, Text, View, FlatList, Pressable } from "react-native";
import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import images from "@/constants/images";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptions from "@/components/UpcomingSubscriptions";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscription, setexpandedSubscription] = useState<string | null>(null);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/Sign-in');
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={profilePhotoUrl ? { uri: profilePhotoUrl } : images.avatar}
                  className="home-avatar"
                />
                <View>
                  <Text className="home-user-name">{displayName}</Text>
                  <Text className="text-sm font-sans-medium pl-4 text-muted-foreground">Welcome back</Text>
                </View>
              </View>
              <Pressable
                onPress={handleSignOut}
                className="rounded-full bg-white/90 px-4 py-2 shadow-sm shadow-black/5"
              >
                <Text className="text-sm font-sans-semibold text-primary">Sign out</Text>
              </Pressable>
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
            <View className="mt-5 rounded-[32px] border border-black/10 bg-white p-5 shadow-sm shadow-black/5">
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
        data={HOME_SUBSCRIPTIONS}
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
