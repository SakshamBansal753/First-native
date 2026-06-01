import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, TextInput, View, Text } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { useAuth, useSignUp } from '@clerk/expo';
import { ThemedView } from '@/components/themed-view';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, fetchStatus } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState('');

  const emailIsValid = EMAIL_REGEX.test(email.trim());
  const passwordIsValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = emailIsValid && passwordIsValid && passwordsMatch && fetchStatus !== 'fetching';
  const isVerifyStep =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  const navigateToHome = (url: string) => {
    if (typeof window !== 'undefined' && url.startsWith('http')) {
      window.location.href = url;
      return;
    }
    router.replace(url as Href);
  };

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }

        navigateToHome(decorateUrl('/'));
      },
    });
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!emailIsValid) {
      setFormError('Enter a valid email address to keep your account secure.');
      return;
    }

    if (!passwordIsValid) {
      setFormError('Choose a stronger password with at least 8 characters.');
      return;
    }

    if (!passwordsMatch) {
      setFormError('Passwords do not match. Please check both fields.');
      return;
    }

    const { error } = await signUp.password({ emailAddress: email.trim(), password });

    if (error) {
      setFormError(error.longMessage ?? error.message ?? 'Unable to create your account.');
      return;
    }

    if (signUp.status === 'missing_requirements') {
      await signUp.verifications.sendEmailCode();
    } else if (signUp.status === 'complete') {
      await finalizeSignUp();
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setFormError('Enter the verification code that was sent to your email.');
      return;
    }

    setFormError('');

    await signUp.verifications.verifyEmailCode({ code: code.trim() });

    if (signUp.status === 'complete') {
      await finalizeSignUp();
      return;
    }

    setFormError('Verification failed. Please try again or request a new code.');
  };

  if (isSignedIn) {
    return null;
  }

  return (
    <ThemedView className="flex-1 bg-[#F5EFE2]">
      <SafeAreaView className="flex-1 px-5">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="flex-1 justify-center">
            <View className="items-center">
              <View className="mb-8 flex-row items-center justify-center rounded-[20px] bg-[#FFE7D2] px-4 py-3 shadow-sm shadow-black/10">
                <View className="mr-3 h-14 w-14 items-center justify-center rounded-2xl bg-[#E87B4D] shadow-sm shadow-black/10">
                  <Text className="text-2xl font-sans-bold text-white">R</Text>
                </View>
                <View className="items-start">
                  <Text className="text-2xl font-sans-bold text-[#111827]">Recurly</Text>
                  <Text className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[#6B7280]">SMART BILLING</Text>
                </View>
              </View>

              <Text className="text-center text-[38px] font-sans-extrabold leading-[34px] text-[#111827]">Create your account</Text>
              <Text className="mt-3 font-sans-bold max-w-[300px] text-center text-base leading-7 text-[#6B7280]">
                Start with a secure email and password to manage your subscriptions.
              </Text>
            </View>

            <View className="mt-10 rounded-[24px] border border-[#E7E0D5] bg-white px-5 py-7 shadow-sm shadow-black/5">
              {isVerifyStep ? (
                <View className="space-y-4">
                  <Text className="mb-1 text-sm font-sans-semibold uppercase tracking-[0.16em] text-[#6B7280]">Verify your email</Text>
                  <Text className="mb-4 text-sm leading-7 text-[#6B7280]">
                    We sent a code to your inbox. Enter it below to finish setting up your account.
                  </Text>
                  <TextInput
                    style={{ height: 54 }}
                    className="w-full rounded-[16px] border border-[#E7E0D5] bg-[#FBF7EE] px-4 text-base text-[#111827]"
                    placeholder="Verification code"
                    placeholderTextColor="#8B7C6A"
                    keyboardType="numeric"
                    value={code}
                    onChangeText={setCode}
                    accessibilityLabel="Verification code"
                  />
                  <Pressable
                    onPress={handleVerify}
                    disabled={fetchStatus === 'fetching'}
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, { shadowColor: '#E87B4D', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 }]}
                    className="mt-2 h-[54px] items-center justify-center rounded-[16px] bg-[#E87B4D]"
                  >
                    {fetchStatus === 'fetching' ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-base font-sans-semibold text-white">Verify email</Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => signUp.verifications.sendEmailCode()}
                    className="mt-4 h-[54px] items-center justify-center rounded-[16px] border border-[#E7E0D5] bg-white"
                  >
                    <Text className="text-base font-sans-semibold text-[#111827]">Send a new code</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="space-y-4">
                  <View>
                    <Text className="mb-2 text-sm font-sans-semibold text-[#6B7280]">Email</Text>
                    <TextInput
                      style={{ height: 54 }}
                      className="w-full rounded-[16px] border border-[#E7E0D5] bg-[#FBF7EE] px-4 text-base text-[#111827]"
                      placeholder="Enter your email"
                      placeholderTextColor="#8B7C6A"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      accessibilityLabel="Email"
                    />
                  </View>
                  <View>
                    <Text className="mb-2 text-sm font-sans-semibold text-[#6B7280]">Password</Text>
                    <TextInput
                      style={{ height: 54 }}
                      className="w-full rounded-[16px] border border-[#E7E0D5] bg-[#FBF7EE] px-4 text-base text-[#111827]"
                      placeholder="Enter your password"
                      placeholderTextColor="#8B7C6A"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      accessibilityLabel="Password"
                    />
                  </View>
                  <View>
                    <Text className="mb-2 text-sm font-sans-semibold text-[#6B7280]">Confirm password</Text>
                    <TextInput
                      style={{ height: 54 }}
                      className="w-full rounded-[16px] border border-[#E7E0D5] bg-[#FBF7EE] px-4 text-base text-[#111827]"
                      placeholder="Confirm your password"
                      placeholderTextColor="#8B7C6A"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      accessibilityLabel="Confirm password"
                    />
                  </View>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, { shadowColor: '#E87B4D', shadowOpacity: canSubmit ? 0.18 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: canSubmit ? 4 : 0 }]}
                    className={`mt-2 h-[54px] items-center justify-center rounded-[16px] ${canSubmit ? 'bg-[#E87B4D]' : 'bg-[#F1C1AA]'}`}
                  >
                    {fetchStatus === 'fetching' ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className={`text-base font-sans-semibold ${canSubmit ? 'text-white' : 'text-[#9C4E34]'}`}>
                        Create account
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}

              {formError ? (
                <Text className="mt-4 rounded-[16px] border border-[#F8D4CD] bg-[#FEF1ED] px-4 py-3 text-sm text-[#B02A22]">
                  {formError}
                </Text>
              ) : null}
            </View>

            <View className="mt-6 items-center px-3">
              <Text className="text-sm text-[#6B7280]">Already have an account?</Text>
              <Link href="/(auth)/Sign-in" asChild>
                <Pressable className="mt-2 rounded-full px-1 py-1">
                  <Text className="text-sm font-sans-semibold text-[#E87B4D]">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
