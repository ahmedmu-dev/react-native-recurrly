import type { ReactNode, Ref } from "react";
import type { ImageSourcePropType, TextInput, TextInputProps } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> { }

    interface ListHeadingProps {
        title: string;
    }

    interface AuthShellProps {
        title: string;
        subtitle: string;
        children: ReactNode;
        footer?: ReactNode;
    }

    interface AuthFieldProps extends TextInputProps {
        label: string;
        error?: string | null;
        helper?: string;
        secureToggle?: boolean;
        ref?: Ref<TextInput>;
    }

    interface AuthButtonProps {
        label: string;
        onPress: () => void;
        loading?: boolean;
        disabled?: boolean;
    }

    interface VerifyCodeFormProps {
        email: string;
        loading: boolean;
        formError: string | null;
        submitLabel: string;
        backLabel: string;
        onSubmit: (code: string) => void;
        onResend: () => Promise<void>;
        onBack: () => void;
    }
}

export { };
