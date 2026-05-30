import { View, Text } from 'react-native'
import React from 'react'
import {Link} from "expo-router"
const Signin = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/(auth)/Sign-up">Create Account</Link>
    </View>
  )
}

export default Signin