import { View, Text } from 'react-native'
import React from 'react'
import {Link} from "expo-router"
const Signup = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href="/(auth)/Sign-up">Sign In</Link>
    </View>
  )
}

export default Signup