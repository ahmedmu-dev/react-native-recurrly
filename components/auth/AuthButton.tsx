import { colors } from '@/constants/theme'
import clsx from 'clsx'
import React from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

const AuthButton = ({ label, onPress, loading = false, disabled = false }: AuthButtonProps) => {
    const inactive = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={inactive}
            className={clsx('auth-button', inactive && 'auth-button-disabled')}
            accessibilityRole='button'
            accessibilityLabel={label}
            accessibilityState={{ disabled: inactive, busy: loading }}
        >
            {loading
                ? <ActivityIndicator color={colors.primary} />
                : <Text className='auth-button-text'>{label}</Text>}
        </Pressable>
    )
}

export default AuthButton
