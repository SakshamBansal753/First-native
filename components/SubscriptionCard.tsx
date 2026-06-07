import React from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import { formatCurrency, formatSubscriptionDateTime, formatStatusLabel } from '@/lib/utils'
import clsx from 'clsx'

const SubscriptionCard = (props: SubscriptionCardProps) => {
    const { name, price, currency, icon, billing, color, category, plan, renewalDate, expanded, onPress, paymentMethod, startDate, status, onEdit, onRemove } = props;

    return (
        <Pressable onPress={onPress} className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')} style={!expanded && color ? { backgroundColor: color } : undefined}>
            <View className="sub-head">
                <View className="sub-main">
                    <Image source={icon} className="sub-icon" />
                    <View className="sub-copy">
                        <Text numberOfLines={1} className="sub-title">{name}</Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className="sub-meta">{category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}</Text>
                    </View>
                </View>

                <View className='sub-price-box'>
                    <Text className="sub-price">{formatCurrency(price, currency)}</Text>
                    <Text className="sub-billing">{billing}</Text>
                </View>
            </View>

            {expanded && (
                <View>
                    <View className='sub-bdy'>
                        <View className="sub-details">
                            <View className="sub-row">
                                <View className='sub-row-copy'>
                                    <Text className="sub-label">Category:</Text>
                                    <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>{category?.trim() || plan?.trim()}</Text>
                                </View>
                            </View>

                            <View className="sub-row">
                                <View className='sub-row-copy'>
                                    <Text className="sub-label">Startdate:</Text>
                                    <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>{startDate ? formatSubscriptionDateTime(startDate) : ''}</Text>
                                </View>
                            </View>

                            <View className="sub-row">
                                <View className='sub-row-copy'>
                                    <Text className="sub-label">Renewal Date:</Text>
                                    <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>{renewalDate ? formatSubscriptionDateTime(renewalDate) : ''}</Text>
                                </View>
                            </View>

                            <View className="sub-row">
                                <View className='sub-row-copy'>
                                    <Text className="sub-label">Payment:</Text>
                                    <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>{paymentMethod?.trim()}</Text>
                                </View>
                            </View>

                            <View className="sub-row">
                                <View className='sub-row-copy'>
                                    <Text className="sub-label">Status:</Text>
                                    <Text className="sub-value" numberOfLines={1} ellipsizeMode='tail'>{status ? formatStatusLabel(status) : ''}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-4">
                        {onEdit && (
                            <Pressable onPress={onEdit} className="auth-button flex-1">
                                <Text className="auth-button-text">Edit</Text>
                            </Pressable>
                        )}

                        {onRemove && (
                            <Pressable onPress={onRemove} className="rounded-3xl border border-border px-4 py-3 items-center justify-center">
                                <Text className="text-sm text-muted-foreground">Remove</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            )}
        </Pressable>
    )
}

export default SubscriptionCard