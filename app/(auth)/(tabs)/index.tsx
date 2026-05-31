import "@/global.css"
import dayjs from "dayjs";

import { Image, Text, View,FlatList } from "react-native";
 import { Link } from "expo-router";
import  images  from "@/constants/images";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptions from "@/components/UpcomingSubscriptions";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";

const SafeAreaView=styled(RNSafeAreaView)
export default function App() {
  const [expandedSubscription,setexpandedSubscription]=useState<string|null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
     
       
       
        <FlatList 
        ListHeaderComponent={()=>(
          <>
           <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar"/>
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>
        <Image source={icons.add} className="home-add-icon"/> 
      </View>
      <View className="home-balance-card">
        <Text className="Home-balance-label">Balance</Text>
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
        <ListHeading title="Upcoming"/>
        <FlatList 
        
        data={UPCOMING_SUBSCRIPTIONS} renderItem={({item})=>(
          <UpcomingSubscriptions {...item}/>

        )}
        keyExtractor={(item)=>item.id}
        horizontal
        ListEmptyComponent={<Text className="home-empty-state">No Upcoming subscriptions</Text>}/>
      </View>
       <ListHeading title="All subscriptions"/>
          </>
        )}

        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item)=>item.id}
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
ItemSeparatorComponent={()=><View className="h-4"/>}
showsVerticalScrollIndicator={false}
ListEmptyComponent={
  <Text className="home-empty-state">
    No subscription yet
  </Text>
}
  contentContainerStyle={{ paddingBottom: 200 }}/>
       
      

    </SafeAreaView>
  );
}