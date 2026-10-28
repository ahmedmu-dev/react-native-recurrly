import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { getDisplayName } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { posthogLog } from "@/lib/posthog-logs";
import { useSubscriptions } from "@/lib/subscriptions";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";

import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSupscriptionId, setExpandedSupscriptionId] = useState<string | null>(null);
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useUser();
  const displayName = getDisplayName(user);

  const handleCreateSubscription = (subscription: Subscription) => {
    addSubscription(subscription);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                {user?.imageUrl
                  ? <Image source={{ uri: user.imageUrl }} className="home-avatar" accessibilityLabel={`${displayName}'s profile photo`} />
                  : <View className="home-avatar bg-muted" />}
                <Text className="home-user-name" numberOfLines={1}>{displayName}</Text>
              </View>

              <Pressable
                onPress={() => setIsCreateOpen(true)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className='home-balance-card'>
              <Text className='home-balance-label'>Balance</Text>

              <View className='home-balance-row'>
                <Text className='home-balance-amount'>{formatCurrency(HOME_BALANCE.amount)}</Text>
                <Text className='home-balance-date'>{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}</Text>
              </View>
            </View>

            <View className='mb-5'>
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet</Text>}
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSupscriptionId === item.id}
            onPress={() => {
              const isExpanded = expandedSupscriptionId !== item.id;
              posthog?.capture("subscription_details_toggled", {
                subscription_id: item.id,
                is_expanded: isExpanded,
              });
              posthogLog.info("subscription_details_toggled", {
                subscription_id: item.id,
                is_expanded: isExpanded,
              });
              setExpandedSupscriptionId(isExpanded ? item.id : null);
            }}
          />
        )}
        extraData={expandedSupscriptionId}
        ItemSeparatorComponent={() => <View className='h-4' />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet</Text>}
        contentContainerClassName="pb-20"
      />

      <CreateSubscriptionModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}