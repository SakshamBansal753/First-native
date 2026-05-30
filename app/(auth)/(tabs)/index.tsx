import "@/global.css"
import { Text, View } from "react-native";
 import { Link } from "expo-router";
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewi
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">
        Go to OnBoarding
      </Link>
       <Link href="/(auth)/Sign-in" className="mt-4 rounded bg-primary text-white p-4">
        Already have account sign in
      </Link>
       <Link href="/(auth)/Sign-up" className="mt-4 rounded bg-primary text-white p-4">
        Sign UP
      </Link>
      <Link href="/subscriptions/spotify">Spotify Subscriptions</Link>
      <Link 
      href={{
        pathname:"/subscriptions/[id]",
        params:{id:'claude'},
      }}>
        Claude Max Subscriptions
      </Link>
    </View>
  );
}