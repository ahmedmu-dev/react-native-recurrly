import AuthButton from '@/components/auth/AuthButton'
import AuthField from '@/components/auth/AuthField'
import { icons } from '@/constants/icons'
import { posthog } from '@/lib/posthog'
import clsx from 'clsx'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native'

const FREQUENCIES: SubscriptionFrequency[] = ['Monthly', 'Yearly'];

const CATEGORY_COLORS = {
    'Entertainment': '#f7c6c7',
    'AI Tools': '#b8d4e3',
    'Developer Tools': '#e8def8',
    'Design': '#f5c542',
    'Productivity': '#c9e4ca',
    'Cloud': '#cfe3f7',
    'Music': '#b8e8d0',
    'Other': '#f6eecf',
} as const;

type Category = keyof typeof CATEGORY_COLORS;

const CATEGORIES = Object.keys(CATEGORY_COLORS) as Category[];

const DEFAULT_FREQUENCY: SubscriptionFrequency = 'Monthly';
const DEFAULT_CATEGORY: Category = 'Other';

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CreateSubscriptionModal = ({ visible, onClose, onCreate }: CreateSubscriptionModalProps) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [frequency, setFrequency] = useState<SubscriptionFrequency>(DEFAULT_FREQUENCY);
    const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);

    // decimal-pad shows a comma on some locales
    const parsedPrice = Number(price.replace(',', '.'));
    const isPriceValid = price.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice > 0;
    const isValid = name.trim() !== '' && isPriceValid;

    const resetForm = () => {
        setName('');
        setPrice('');
        setFrequency(DEFAULT_FREQUENCY);
        setCategory(DEFAULT_CATEGORY);
    };

    const handleSubmit = () => {
        if (!isValid) return;

        const now = dayjs();
        onCreate({
            id: `${slugify(name) || 'subscription'}-${Date.now()}`,
            name: name.trim(),
            price: parsedPrice,
            currency: 'USD',
            frequency,
            billing: frequency,
            category,
            status: 'active',
            startDate: now.toISOString(),
            renewalDate: now.add(1, frequency === 'Monthly' ? 'month' : 'year').toISOString(),
            icon: icons.wallet,
            color: CATEGORY_COLORS[category],
        });

        posthog?.capture("subscription_created", {
            subscription_id: `${slugify(name) || 'subscription'}-${Date.now()}`,
            subscription_name: name.trim(),
            subscription_price: parsedPrice,
            subscription_frequency: frequency,
            category: category ?? "Other",
        });

        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
            <KeyboardAvoidingView className='flex-1' behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View className='modal-overlay'>
                    <Pressable className='absolute inset-0' onPress={onClose} accessibilityLabel='Close' />

                    <View className='modal-container'>
                        <View className='modal-header'>
                            <Text className='modal-title'>New Subscription</Text>
                            <Pressable
                                onPress={onClose}
                                className='modal-close'
                                hitSlop={8}
                                accessibilityRole='button'
                                accessibilityLabel='Close'
                            >
                                <Text className='modal-close-text'>✕</Text>
                            </Pressable>
                        </View>

                        <ScrollView keyboardShouldPersistTaps='handled' contentContainerClassName='modal-body'>
                            <AuthField
                                label='Name'
                                value={name}
                                onChangeText={setName}
                                placeholder='e.g. Netflix'
                                autoCapitalize='words'
                                returnKeyType='next'
                            />

                            <AuthField
                                label='Price'
                                value={price}
                                onChangeText={setPrice}
                                placeholder='0.00'
                                keyboardType='decimal-pad'
                                error={price.trim() && !isPriceValid ? 'Enter a price greater than 0' : null}
                            />

                            <View className='auth-field'>
                                <Text className='auth-label'>Frequency</Text>
                                <View className='picker-row'>
                                    {FREQUENCIES.map((option) => {
                                        const active = frequency === option;
                                        return (
                                            <Pressable
                                                key={option}
                                                onPress={() => setFrequency(option)}
                                                className={clsx('picker-option', active && 'picker-option-active')}
                                                accessibilityRole='radio'
                                                accessibilityState={{ selected: active }}
                                            >
                                                <Text className={clsx('picker-option-text', active && 'picker-option-text-active')}>{option}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className='auth-field'>
                                <Text className='auth-label'>Category</Text>
                                <View className='category-scroll'>
                                    {CATEGORIES.map((option) => {
                                        const active = category === option;
                                        return (
                                            <Pressable
                                                key={option}
                                                onPress={() => setCategory(option)}
                                                className={clsx('category-chip', active && 'category-chip-active')}
                                                accessibilityRole='radio'
                                                accessibilityState={{ selected: active }}
                                            >
                                                <Text className={clsx('category-chip-text', active && 'category-chip-text-active')}>{option}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <AuthButton label='Add Subscription' onPress={handleSubmit} disabled={!isValid} />
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

export default CreateSubscriptionModal
