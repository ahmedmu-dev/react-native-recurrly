import { BRAND } from '@/constants/brand'
import { styled } from 'nativewind'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
const SafeAreaView = styled(RNSafeAreaView);

const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => {
    return (
        <SafeAreaView className='auth-safe-area'>
            <KeyboardAvoidingView className='auth-screen' behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    className='auth-scroll'
                    contentContainerClassName='auth-content'
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                >
                    <View className='auth-brand-block'>
                        <View className='auth-logo-wrap' accessible accessibilityLabel={`${BRAND.name}, ${BRAND.tagline}`}>
                            <View className='auth-logo-mark'>
                                <Text className='auth-logo-mark-text'>{BRAND.initial}</Text>
                            </View>
                            <View>
                                <Text className='auth-wordmark'>{BRAND.name}</Text>
                                <Text className='auth-wordmark-sub'>{BRAND.tagline}</Text>
                            </View>
                        </View>

                        <Text className='auth-title' accessibilityRole='header'>{title}</Text>
                        <Text className='auth-subtitle'>{subtitle}</Text>
                    </View>

                    <View className='auth-card'>
                        {children}
                        {footer}
                    </View>

                    <Text className='auth-helper mt-6 text-center'>Your sign-in is encrypted and secure</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default AuthShell
