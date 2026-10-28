import { colors } from "@/constants/theme";
import { getDisplayName } from "@/lib/auth";
import { useAuth, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const { signOut } = useAuth();
    const { user } = useUser();
    const [signingOut, setSigningOut] = useState(false);

    const displayName = getDisplayName(user);
    const email = user?.primaryEmailAddress?.emailAddress;

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            // The tabs layout redirects to sign-in once the session ends.
            await signOut();
        } catch {
            setSigningOut(false);
            Alert.alert("Couldn't sign out", "Check your connection and try again.");
        }
    };

    const confirmSignOut = () => {
        // react-native-web's Alert can't show buttons, so sign out directly there.
        if (Platform.OS === "web") {
            handleSignOut();
            return;
        }
        Alert.alert("Sign out?", "You'll need to sign in again to manage your subscriptions.", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign out", style: "destructive", onPress: handleSignOut },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="settings-title" accessibilityRole="header">Settings</Text>

            <View className="settings-card">
                {user?.imageUrl
                    ? <Image source={{ uri: user.imageUrl }} className="settings-avatar" accessibilityLabel={`${displayName}'s profile photo`} />
                    : <View className="settings-avatar" />}
                <View className="settings-profile-copy">
                    <Text className="settings-name" numberOfLines={1}>{displayName}</Text>
                    {email && <Text className="settings-email" numberOfLines={1}>{email}</Text>}
                </View>
            </View>

            <Text className="settings-section-label">Account</Text>

            <Pressable
                onPress={confirmSignOut}
                disabled={signingOut}
                className="settings-signout"
                accessibilityRole="button"
                accessibilityState={{ disabled: signingOut, busy: signingOut }}
            >
                {signingOut
                    ? <ActivityIndicator color={colors.destructive} />
                    : <Text className="settings-signout-text">Sign out</Text>}
            </Pressable>
        </SafeAreaView>
    )
}

export default Settings
