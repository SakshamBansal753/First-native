import { Stack,SplashScreen } from "expo-router";
import "@/global.css"
import {useEffect} from "react"
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
export default function  RootLayout(){
const [fontsLoaded] = useFonts({
  "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
  "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
  "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
  "sans-semiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
});
  useEffect(()=>{
    if(fontsLoaded){
      SplashScreen.hideAsync();
    }
  },[fontsLoaded])
  if(!fontsLoaded){ return null;}
    return <Stack screenOptions={{headerShown:false}} />
}