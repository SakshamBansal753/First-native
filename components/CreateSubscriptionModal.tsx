import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import clsx from 'clsx';
import { icons } from '@/constants/icons';
import dayjs from 'dayjs';
import { styled } from 'nativewind';

const Container = styled(View);

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (s: any) => void;
  initialData?: any;
  onUpdate?: (s: any) => void;
};

const CATEGORY_OPTIONS = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#f5c542',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#b8e8d0',
  Productivity: '#ffd7d7',
  Cloud: '#cfe8ff',
  Music: '#f3d1ff',
  Other: '#e6f7ef',
};

export default function CreateSubscriptionModal({ visible, onClose, onCreate, initialData, onUpdate }: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>(initialData?.billing ?? 'Monthly');
  const [category, setCategory] = useState(initialData?.category ?? CATEGORY_OPTIONS[0]);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.icon?.uri ?? null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory(CATEGORY_OPTIONS[0]);
    setLogoUrl(null);
    setSubmitting(false);
  };

  const handleSubmit = () => {
    const parsedPrice = parseFloat(price);
    if (!name.trim()) {
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return;
    }

    setSubmitting(true);

    const now = dayjs();
    const renewal = frequency === 'Monthly' ? now.add(1, 'month') : now.add(1, 'year');

    const sub = {
      id: `${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      currency: 'USD',
      icon: logoUrl ? { uri: logoUrl } : icons.wallet,
      billing: frequency,
      plan: frequency,
      category,
      status: 'active',
      startDate: now.toISOString(),
      renewalDate: renewal.toISOString(),
      color: CATEGORY_COLORS[category] ?? '#fff8e7',
      userCreated: true,
    };

    if (initialData && onUpdate) {
      onUpdate({ ...initialData, ...sub });
    } else {
      onCreate(sub);
    }
    reset();
    onClose();
  };

  const canSubmit = name.trim().length > 0 && !Number.isNaN(parseFloat(price)) && parseFloat(price) > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="modal-overlay">
        <Container className="modal-container">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable onPress={onClose} className="modal-close">
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <View className="modal-body">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full overflow-hidden bg-muted items-center justify-center">
                  {logoUrl ? (
                    <Image source={{ uri: logoUrl }} className="w-12 h-12" />
                  ) : (
                    <Image source={icons.wallet} className="w-8 h-8" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-1">Logo preview (auto from name)</Text>
                  <TextInput value={logoUrl ?? ''} onChangeText={setLogoUrl} placeholder="Logo URL (optional)" className="auth-input" />
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    // auto-suggest logo using clearbit domain guess
                    const slug = t.trim().toLowerCase().replace(/\s+/g, '');
                    if (slug) {
                      setLogoUrl(`https://logo.clearbit.com/${slug}.com`);
                    }
                  }}
                  placeholder="Subscription name"
                  className="auth-input"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  value={price}
                  onChangeText={(t) => setPrice(t)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="auth-input"
                />
              </View>

              <View>
                <Text className="auth-label mb-2">Frequency</Text>
                <View className="picker-row">
                  {(['Monthly', 'Yearly'] as const).map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => setFrequency(f)}
                      className={clsx('picker-option', frequency === f && 'picker-option-active')}
                    >
                      <Text className={clsx('picker-option-text', frequency === f && 'picker-option-text-active')}>{f}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View>
                <Text className="auth-label mb-2">Category</Text>
                <View className="category-scroll">
                  {CATEGORY_OPTIONS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      className={clsx('category-chip', c === category && 'category-chip-active')}
                    >
                      <Text className={clsx('category-chip-text', c === category && 'category-chip-text-active')}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className={clsx('auth-button flex-1', (!canSubmit || submitting) && 'auth-button-disabled')}
                >
                  <Text className="auth-button-text">{submitting ? 'Saving...' : initialData ? 'Update subscription' : 'Create subscription'}</Text>
                </Pressable>
                <Pressable onPress={() => { reset(); onClose(); }} className="rounded-3xl border border-border px-4 py-3 items-center justify-center">
                  <Text className="text-sm text-muted-foreground">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Container>
      </View>
    </Modal>
  );
}
