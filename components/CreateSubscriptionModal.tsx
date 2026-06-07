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
  ScrollView,
} from 'react-native';
import clsx from 'clsx';
import { icons } from '@/constants/icons';
import dayjs from 'dayjs';

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
  const [startDate, setStartDate] = useState(initialData?.startDate ? initialData.startDate.split('T')[0] : dayjs().format('YYYY-MM-DD'));
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.icon?.uri ?? null);
  const [renewalDate, setRenewalDate] = useState(initialData?.renewalDate ? initialData.renewalDate.split('T')[0] : '');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory(CATEGORY_OPTIONS[0]);
    setLogoUrl(null);
    setRenewalDate('');
    setSubmitting(false);
  };

  let lastSuggestId = 0;
  const suggestLogo = async (slug: string) => {
    if (!slug) return;
    const id = ++lastSuggestId;
    const variants = [
      `https://logo.clearbit.com/${slug}.com`,
      `https://www.google.com/s2/favicons?sz=128&domain=${slug}.com`,
      `https://icons.duckduckgo.com/ip3/${slug}.com.ico`,
    ];

    for (const url of variants) {
      try {
        // prefetch returns boolean; ensure it's reachable before setting
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ok = await Image.prefetch(url);
        if (!ok) continue;
        if (id !== lastSuggestId) return; // newer request exists
        setLogoUrl(url);
        return;
      } catch (e) {
        // ignore and try next
      }
    }
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
    const base = startDate ? dayjs(startDate) : dayjs();
    const now = base;
    const renewal = renewalDate ? dayjs(renewalDate) : (frequency === 'Monthly' ? now.add(1, 'month') : now.add(1, 'year'));

    const sub = {
      id: `${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      currency: 'INR',
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
    <Modal
    className="bg-background"
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={{ flex: 1, }} >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View className="bg-background text-2xl text-black"
            style={{
              width: '100%',
              minHeight: 520,
              maxHeight: '85%',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
                
              overflow: 'hidden',
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
              style={{ flex: 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#374151', paddingHorizontal: 20, paddingVertical: 16 }}>
                <Text style={{ color: 'black', fontSize: 20, fontWeight: '700' }}>New Subscription</Text>
                <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'black', fontSize: 20 }}>×</Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 32, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' }}>
                    {logoUrl ? (
                      <Image source={{ uri: logoUrl }} style={{ width: 48, height: 48 }} />
                    ) : (
                      <Image source={icons.wallet} style={{ width: 28, height: 28, tintColor: 'black' }} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Logo preview (auto from name)</Text>
                    <TextInput
                      value={logoUrl ?? ''}
                      onChangeText={setLogoUrl}
                      placeholder="Logo URL (optional)"
                      placeholderTextColor="#6b7280"
                      style={{ backgroundColor: '#1f2937', color: 'black', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: 18 }}>
                  <Text style={{ color: 'black', marginBottom: 10 }}>Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      const slug = t.trim().toLowerCase().replace(/\s+/g, '');
                      if (slug) suggestLogo(slug);
                    }}
                    placeholder="Subscription name"
                    placeholderTextColor="#6b7280"
                    style={{ backgroundColor: '#1f2937', color: 'black', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}
                  />
                </View>

                <View style={{ marginBottom: 18 }}>
                  <Text style={{ color: 'black', marginBottom: 10 }}>Price</Text>
                  <TextInput
                    value={price}
                    onChangeText={(t) => setPrice(t)}
                    placeholder="0.00"
                    placeholderTextColor="#6b7280"
                    keyboardType="decimal-pad"
                    style={{ backgroundColor: '#1f2937', color: 'black', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}
                  />
                </View>

                <View style={{ marginBottom: 18 }}>
                  <Text style={{ color: 'black', marginBottom: 10 }}>Start date</Text>
                  <TextInput
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6b7280"
                    style={{ backgroundColor: '#1f2937', color: 'black', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}
                  />
                  <Text style={{ color: '#9CA3AF', marginTop: 8, fontSize: 12 }}>Provide start date (YYYY-MM-DD) for upcoming calculation.</Text>
                </View>

                <View style={{ marginBottom: 18 }}>
                  <Text style={{ color: 'black', marginBottom: 10 }}>Renewal / Expiry date (optional)</Text>
                  <TextInput
                    value={renewalDate}
                    onChangeText={setRenewalDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6b7280"
                    style={{ backgroundColor: '#1f2937', color: 'black', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}
                  />
                  <Text style={{ color: '#9CA3AF', marginTop: 8, fontSize: 12 }}>If set, this date will be used instead of auto-calculated renewal.</Text>
                </View>

                <View style={{ marginBottom: 18 }}>
                  <Text style={{ color: 'black', marginBottom: 10 }}>Frequency</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {(['Monthly', 'Yearly'] as const).map((f) => (
                      <Pressable
                        key={f}
                        onPress={() => setFrequency(f)}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          paddingVertical: 12,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: frequency === f ? '#f59e0b' : '#374151',
                          backgroundColor: frequency === f ? '#f59e0b20' : '#111827',
                        }}
                      >
                        <Text style={{ color: frequency === f ? '#f59e0b' : '#d1d5db' }}>{f}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <Text style={{ color: 'black', marginBottom: 10 }}>Category</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {CATEGORY_OPTIONS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setCategory(c)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: c === category ? '#f59e0b' : '#374151',
                          backgroundColor: c === category ? '#f59e0b20' : '#111827',
                        }}
                      >
                        <Text style={{ color: c === category ? '#fbbf24' : '#d1d5db' }}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!canSubmit || submitting}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      borderRadius: 18,
                      backgroundColor: canSubmit ? '#f59e0b' : '#374151',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: canSubmit ? '#111827' : '#9ca3af', fontWeight: '700' }}>{submitting ? 'Saving...' : initialData ? 'Update subscription' : 'Create subscription'}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { reset(); onClose(); }}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: '#374151',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#d1d5db', fontWeight: '700' }}>Cancel</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
