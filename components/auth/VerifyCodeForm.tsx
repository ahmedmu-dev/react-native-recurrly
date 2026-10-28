import { CODE_LENGTH, RESEND_COOLDOWN_SECONDS, validateCode } from '@/lib/auth'
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import AuthButton from './AuthButton'
import AuthField from './AuthField'

const VerifyCodeForm = ({ email, loading, formError, submitLabel, backLabel, onSubmit, onResend, onBack }: VerifyCodeFormProps) => {
    const [code, setCode] = useState('');
    const [showErrors, setShowErrors] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const codeError = showErrors ? validateCode(code) : null;

    const handleSubmit = () => {
        setShowErrors(true);
        if (validateCode(code) || loading) return;
        onSubmit(code);
    };

    const handleResend = async () => {
        if (cooldown > 0 || loading) return;
        if (!(await onResend())) return;
        setCode('');
        setShowErrors(false);
        setCooldown(RESEND_COOLDOWN_SECONDS);
    };

    return (
        <View className='auth-form'>
            <Text className='auth-helper'>
                We sent a {CODE_LENGTH}-digit code to <Text className='font-sans-bold text-primary'>{email}</Text>
            </Text>

            <AuthField
                label='Verification code'
                placeholder={'0'.repeat(CODE_LENGTH)}
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                error={codeError}
                keyboardType='number-pad'
                textContentType='oneTimeCode'
                autoComplete='one-time-code'
                maxLength={CODE_LENGTH}
                returnKeyType='done'
                onSubmitEditing={handleSubmit}
                autoFocus
            />

            {formError && <Text className='auth-error' accessibilityLiveRegion='polite'>{formError}</Text>}

            <AuthButton label={submitLabel} onPress={handleSubmit} loading={loading} />

            <Pressable
                onPress={handleResend}
                disabled={cooldown > 0 || loading}
                className='auth-secondary-button'
                accessibilityRole='button'
                accessibilityState={{ disabled: cooldown > 0 || loading }}
            >
                <Text className='auth-secondary-button-text'>
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </Text>
            </Pressable>

            <Pressable onPress={onBack} disabled={loading} className='items-center py-1' accessibilityRole='button'>
                <Text className='auth-link'>{backLabel}</Text>
            </Pressable>
        </View>
    )
}

export default VerifyCodeForm
