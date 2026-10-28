import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import { posthog } from "@/lib/posthog";
import { posthogLog } from "@/lib/posthog-logs";
import { useSubscriptions } from "@/lib/subscriptions";

import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const { subscriptions } = useSubscriptions();
    const [query, setQuery] = useState("");
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

    const normalizedQuery = query.trim().toLowerCase();
    const filteredSubscriptions = useMemo(() => {
        if (!normalizedQuery) return subscriptions;

        return subscriptions.filter((subscription) =>
            [subscription.name, subscription.category, subscription.plan]
                .some((field) => field?.toLowerCase().includes(normalizedQuery))
        );
    }, [subscriptions, normalizedQuery]);

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <ListHeading title="Subscriptions" />

            {/* Kept outside the FlatList so the input doesn't remount and lose focus on each keystroke */}
            <TextInput
                className="subs-search"
                value={query}
                onChangeText={setQuery}
                placeholder="Search subscriptions"
                placeholderTextColor={colors.mutedForeground}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                returnKeyType="search"
                accessibilityLabel="Search subscriptions"
            />

            <FlatList
                data={filteredSubscriptions}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => {
                            const isExpanded = expandedSubscriptionId !== item.id;
                            posthog?.capture("subscription_details_toggled", {
                                subscription_id: item.id,
                                is_expanded: isExpanded,
                            });
                            posthogLog.info("subscription_details_toggled", {
                                subscription_id: item.id,
                                is_expanded: isExpanded,
                            });
                            setExpandedSubscriptionId(isExpanded ? item.id : null);
                        }}
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className='h-4' />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListEmptyComponent={
                    <Text className="home-empty-state">
                        {normalizedQuery ? `No subscriptions match "${query.trim()}"` : "No subscriptions yet"}
                    </Text>
                }
                contentContainerClassName="pb-20"
            />
        </SafeAreaView>
    )
}

export default Subscriptions
