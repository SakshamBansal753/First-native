import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, TextInput, View, Text } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { useAuth, useSignIn } from '@clerk/expo';
import { ThemedView } from '@/components/themed-view';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signin() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState('');

  const emailIsValid = EMAIL_REGEX.test(email.trim());
  const passwordIsValid = password.length >= 8;
  const isFetching = fetchStatus !== 'idle';
  const canSubmit = emailIsValid && passwordIsValid && !isFetching;
  const isSignInReady = Boolean(signIn) && !isFetching;
  const isCodeStep = signIn?.status === 'needs_client_trust';

  const navigateToHome = (url: string) => {
    if (typeof window !== 'undefined' && url.startsWith('http')) {
      window.location.href = url;
      return;
    }
    router.replace(url as Href);
  };

  const finalizeSignIn = async () => {
    await signIn.finalize({
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
      setFormError('Use a valid email address to keep your account secure.');
      return;
    }

    if (!passwordIsValid) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (!signIn) {
      setFormError('Sign in is not ready yet. Please wait a moment and try again.');
      return;
    }

    const { error } = await signIn.password({ emailAddress: email.trim(), password });

    if (error) {
      setFormError(error.longMessage ?? error.message ?? 'Unable to sign in.');
      return;
    }

    if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code',
      );

      if (emailCodeFactor) {
        try {
          await signIn.mfa.sendEmailCode();
        } catch (sendError) {
          console.error('Failed to send email code', sendError);
          setFormError('Unable to send the verification code. Please try again.');
          return;
        }
      }
    } else if (signIn.status === 'complete') {
      await finalizeSignIn();
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setFormError('Enter the verification code that was sent to your email.');
      return;
    }

    setFormError('');

    if (!signIn) {
      setFormError('Sign in is not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      const result = await signIn.mfa.verifyEmailCode({ code: code.trim() });

      if (result?.error) {
        setFormError(result.error.longMessage ?? result.error.message ?? 'Verification failed. Please try the code again.');
        return;
      }
    } catch (verifyError) {
      console.error('Email code verification failed', verifyError);
      setFormError('Verification failed. Please check your code and try again.');
      return;
    }

    if (signIn.status === 'complete') {
      await finalizeSignIn();
      return;
    }

    setFormError('Verification failed. Please try the code again.');
  };

  if (isSignedIn) {
    return null;
  }

  if (!isSignInReady) {
    return (
      <ThemedView className="flex-1 items-center justify-center bg-[#F5EFE2]">
        <ActivityIndicator size="large" color="#E87B4D" />
      </ThemedView>
    );
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

              <Text className="text-center text-[28px] font-sans-extrabold leading-[34px] text-[#111827]">Welcome back</Text>
              <Text className="mt-3 max-w-[300px] text-center text-base leading-7 text-[#6B7280]">
                Sign in to continue managing your subscriptions.
              </Text>
            </View>

            <View className="mt-10 rounded-[24px] border border-[#E7E0D5] bg-white px-5 py-7 shadow-sm shadow-black/5">
              {isCodeStep ? (
                <View className="space-y-4">
                  <View>
                    <Text className="mb-2 text-sm font-sans-semibold text-[#6B7280]">Verification code</Text>
                    <TextInput
                      style={{ height: 54 }}
                      className="w-full rounded-[16px] border border-[#E7E0D5] bg-[#FBF7EE] px-4 text-base text-[#111827]"
                      placeholder="Enter your code"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={code}
                      onChangeText={setCode}
                      accessibilityLabel="Verification code"
                    />
                  </View>
                  <Pressable
                    onPress={handleVerify}
                    disabled={isFetching}
                    style={({ pressed }) => [
                      { opacity: pressed ? 0.9 : 1 },
                      { shadowColor: '#E87B4D', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
                    ]}
                    className="mt-2 h-[54px] items-center justify-center rounded-[16px] bg-[#E87B4D]"
                  >
                    {isFetching ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-base font-sans-semibold text-white">Verify code</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <View className="space-y-4">
                  <View>
                    <Text className="mb-2 text-sm font-sans-semibold text-[#6B7280]">Email</Text>
                    <TextInput
                      style={{ height: 54 }}
                      className="w-full rounded-[16px] border border-[#E7E0D5] bg-[#FBF7EE] px-4 text-base font-sans-semibold text-[#111827]"
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
                      className="w-full rounded-[16px] border border-[#E7E0D5] bg-[#FBF7EE] px-4 text-base font-sans-semibold text-[#111827]"
                      placeholder="Enter your password"
                      placeholderTextColor="#8B7C6A"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      accessibilityLabel="Password"
                    />
                  </View>
                  <View className="mt-2 items-end">
                    <Pressable onPress={() => setFormError('Password recovery is coming soon.')} className="rounded-full px-1 py-1">
                      <Text className="text-sm font-sans-semibold text-[#E87B4D]">Forgot password?</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    style={({ pressed }) => [
                      { opacity: pressed ? 0.9 : 1 },
                      { shadowColor: '#E87B4D', shadowOpacity: canSubmit ? 0.18 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: canSubmit ? 4 : 0 },
                    ]}
                    className={`mt-2 h-[54px] items-center justify-center rounded-[16px] ${
                      canSubmit ? 'bg-[#E87B4D]' : 'bg-[#F1C1AA]'
                    }`}
                  >
                    {isFetching ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className={`text-base font-sans-semibold ${canSubmit ? 'text-white' : 'text-[#9C4E34]'}`}>
                        Sign in
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
              <Text className="text-sm text-[#6B7280]">New to Recurly? </Text>
              <Link href="/(auth)/Sign-up" asChild>
                <Pressable>
                  <Text className="text-sm font-sans-semibold text-[#E87B4D]">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
