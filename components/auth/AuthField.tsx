import { colors } from '@/constants/theme'
import clsx from 'clsx'
import React, { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

const AuthField = ({ label, error, helper, secureToggle, secureTextEntry, ref, ...inputProps }: AuthFieldProps) => {
    const [hidden, setHidden] = useState(true);

    return (
        <View className='auth-field'>
            <Text className='auth-label'>{label}</Text>

            <View className='relative justify-center'>
                <TextInput
                    ref={ref}
                    className={clsx('auth-input', error && 'auth-input-error', secureToggle && 'pr-16')}
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={secureToggle ? hidden : secureTextEntry}
                    accessibilityLabel={label}
                    accessibilityHint={error || helper}
                    {...inputProps}
                />

                {secureToggle && (
                    <Pressable
                        onPress={() => setHidden((current) => !current)}
                        className='absolute right-4'
                        hitSlop={12}
                        accessibilityRole='button'
                        accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
                    >
                        <Text className='auth-link'>{hidden ? 'Show' : 'Hide'}</Text>
                    </Pressable>
                )}
            </View>

            {error ? (
                <Text className='auth-error' accessibilityLiveRegion='polite'>{error}</Text>
            ) : helper ? (
                <Text className='auth-helper'>{helper}</Text>
            ) : null}
        </View>
    )
}

export default AuthField
