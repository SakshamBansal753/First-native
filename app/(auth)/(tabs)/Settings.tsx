import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView as RNSafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { styled } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import images from '@/constants/images';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [name, setName] = useState('');
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const displayName =
      user.firstName || user.lastName
        ? `${user.firstName ?? ''}${user.lastName ? ` ${user.lastName}` : ''}`.trim()
        : user.primaryEmailAddress?.emailAddress
        ? user.primaryEmailAddress.emailAddress.split('@')[0]
        : 'Subscriber';

    setName(displayName);

    const profilePhotoKey = `profilePhotoUri_${user.id}`;

    const loadLocalPhoto = async () => {
      const storedUri = await SecureStore.getItemAsync(profilePhotoKey);
      if (storedUri) {
        setLocalPhotoUri(storedUri);
      }
    };

    loadLocalPhoto();
  }, [user]);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        'Photo access required',
        'Please allow access to your photo library to upload a profile photo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const uri = result.assets[0].uri;
    setLocalPhotoUri(uri);
    setStatusMessage('Selected a new photo. Save to keep it.');
  };


  const handleSave = async () => {
    if (!user) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Profile update', 'Please enter a valid name.');
      return;
    }

    const [firstName, ...rest] = trimmedName.split(' ');
    const lastName = rest.join(' ');

    try {
      setSaving(true);

      if (localPhotoUri) {
        const profilePhotoKey = `profilePhotoUri_${user.id}`;
        await SecureStore.setItemAsync(profilePhotoKey, localPhotoUri);
      }

      await (user as any).update({
        firstName,
        lastName,
      });

      setStatusMessage('Profile saved successfully.');
    } catch (error) {
      console.error('Profile update failed', error);
      Alert.alert('Update failed', 'Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/Sign-in');
    } catch (error) {
      console.error('Sign out failed', error);
      Alert.alert('Sign out failed', 'Please try again.');
    }
  };

  const avatarSource = localPhotoUri
    ? { uri: localPhotoUri }
    : user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-6 rounded-4xl border border-black/10 bg-white p-6 shadow-sm shadow-black/5">
        <View className="items-center justify-center space-y-3 border-b border-black/5 pb-6">
          <Image source={avatarSource} className="h-30 w-30 rounded-full bg-muted" />
          <Text className="text-2xl font-sans-semibold text-primary">Profile</Text>
          <Text className="text-sm text-muted-foreground text-center">
            Upload a photo from your device and update your account name.
          </Text>
        </View>

        <View className="mt-7 space-y-4">
          <View>
            <Text className="mb-2 text-sm font-sans-semibold text-primary">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              className="rounded-3xl border border-black/10 bg-background px-4 py-3 text-base text-primary space-x-1.5"
              placeholderTextColor="#8B8B9C"
              returnKeyType="done"
            />
          </View>

          <View className="rounded-4xl border border-black/10 bg-slate-50 p-5 shadow-sm shadow-black/5 mt-4">
            <Text className="mb-3 text-sm font-sans-semibold uppercase tracking-[0.15em] text-primary/80">Profile photo</Text>
            <Pressable
              onPress={handlePickPhoto}
              className="rounded-3xl bg-primary px-5 py-4 items-center justify-center"
            >
              <Text className="text-base font-sans-semibold text-white">Choose from device</Text>
            </Pressable>
            <Text className="mt-3 text-sm text-muted-foreground">
              Tap to select a new profile photo from your device. Save to keep this image for your profile locally.
            </Text>
          </View>

          {statusMessage ? (
            <Text className="text-sm text-[#16a34a]">{statusMessage}</Text>
          ) : null}

          <Pressable
            onPress={handleSave}
            className="rounded-3xl bg-accent px-5 py-4 items-center justify-center"
            disabled={saving}
          >
            <Text className="text-base font-sans-semibold text-white">
              {saving ? 'Saving...' : 'Save changes'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-8 rounded-4xl border border-black/10 bg-white p-6 shadow-sm shadow-black/5">
        <Text className="mb-2 text-base font-sans-semibold text-primary">Account</Text>
        <Text className="mb-4 text-sm text-muted-foreground">
          Sign out of your account to switch users or secure your session.
        </Text>
        <Pressable
          onPress={handleSignOut}
          className="rounded-3xl bg-destructive px-5 py-4 items-center justify-center"
        >
          <Text className="text-base font-sans-semibold text-white">Sign out</Text>
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
