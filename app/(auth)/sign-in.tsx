import AuthButton from "@/components/auth/AuthButton";
import AuthField from "@/components/auth/AuthField";
import AuthShell from "@/components/auth/AuthShell";
import VerifyCodeForm from "@/components/auth/VerifyCodeForm";
import { BRAND } from "@/constants/brand";
import { getAuthErrorMessage, validateEmail } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { posthogLog } from "@/lib/posthog-logs";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

const SignIn = () => {
    const { signIn, fetchStatus } = useSignIn();
    const router = useRouter();
    const passwordRef = useRef<TextInput>(null);

    const [step, setStep] = useState<"credentials" | "verify">("credentials");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState({ email: false, password: false });
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loading = fetchStatus === "fetching";
    const emailError = touched.email || submitted ? validateEmail(email) : null;
    const passwordError = touched.password || submitted ? (password ? null : "Enter your password") : null;

    const finishSignIn = async () => {
        const { error } = await signIn.finalize({
            navigate: ({ session }) => {
                if (session?.currentTask) {
                    setFormError("Your account needs one more step before you can continue");
                    return;
                }
                if (!session?.user?.id) {
                    setFormError("We couldn't finish signing you in. Please try again");
                    return;
                }

                posthog?.identify(session.user.id, {
                    $set: { email: email.trim() },
                });
                posthog?.capture("user_signed_in");
                posthogLog.info("sign_in_completed", {
                    authentication_method: step === "verify" ? "email_code" : "password",
                });
                router.replace("/");
            },
        });
        if (error) setFormError(getAuthErrorMessage(error));
    };

    const sendEmailCode = async () => {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) setFormError(getAuthErrorMessage(error));
        return !error;
    };

    const handleSignIn = async () => {
        setSubmitted(true);
        if (validateEmail(email) || !password || loading) return;
        setFormError(null);

        const { error } = await signIn.password({ emailAddress: email.trim(), password });
        if (error) {
            setFormError(getAuthErrorMessage(error));
            return;
        }

        if (signIn.status === "complete") {
            await finishSignIn();
            return;
        }

        // New devices and accounts with two-step verification confirm via an email code.
        if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
            const hasEmailCode = signIn.supportedSecondFactors.some((factor) => factor.strategy === "email_code");
            if (!hasEmailCode) {
                setFormError("This account uses a verification method that isn't available in the app yet");
                return;
            }
            if (await sendEmailCode()) setStep("verify");
            return;
        }

        setFormError(getAuthErrorMessage(null));
    };

    const handleVerify = async (code: string) => {
        setFormError(null);
        const { error } = await signIn.mfa.verifyEmailCode({ code });
        if (error) {
            setFormError(getAuthErrorMessage(error));
            return;
        }

        if (signIn.status === "complete") {
            await finishSignIn();
            return;
        }

        setFormError(getAuthErrorMessage(null));
    };

    const handleUseDifferentAccount = () => {
        signIn.reset();
        setPassword("");
        setFormError(null);
        setSubmitted(false);
        setTouched({ email: false, password: false });
        setStep("credentials");
    };

    if (step === "verify") {
        return (
            <AuthShell title="Confirm it's you" subtitle="For your security, enter the code we just emailed you">
                <VerifyCodeForm
                    email={email.trim()}
                    loading={loading}
                    formError={formError}
                    submitLabel="Verify and sign in"
                    backLabel="Use a different account"
                    onSubmit={handleVerify}
                    onResend={async () => {
                        setFormError(null);
                        return sendEmailCode();
                    }}
                    onBack={handleUseDifferentAccount}
                />
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue managing your subscriptions"
            footer={
                <View className="auth-link-row">
                    <Text className="auth-link-copy">New to {BRAND.name}?</Text>
                    <Link href="/(auth)/sign-up" replace>
                        <Text className="auth-link">Create an account</Text>
                    </Link>
                </View>
            }
        >
            <View className="auth-form">
                <AuthField
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    error={emailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="username"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    submitBehavior="submit"
                />

                <AuthField
                    ref={passwordRef}
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                    error={passwordError}
                    secureToggle
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={handleSignIn}
                />

                {formError && <Text className="auth-error" accessibilityLiveRegion="polite">{formError}</Text>}

                <AuthButton label="Sign in" onPress={handleSignIn} loading={loading} />
            </View>
        </AuthShell>
    );
};

export default SignIn;
