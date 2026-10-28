import AuthButton from "@/components/auth/AuthButton";
import AuthField from "@/components/auth/AuthField";
import AuthShell from "@/components/auth/AuthShell";
import VerifyCodeForm from "@/components/auth/VerifyCodeForm";
import { getAuthErrorMessage, PASSWORD_MIN_LENGTH, validateEmail, validatePassword } from "@/lib/auth";
import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

const SignUp = () => {
    const { signUp, fetchStatus } = useSignUp();
    const router = useRouter();
    const passwordRef = useRef<TextInput>(null);

    const [step, setStep] = useState<"details" | "verify">("details");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState({ email: false, password: false });
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loading = fetchStatus === "fetching";
    const emailError = touched.email || submitted ? validateEmail(email) : null;
    const passwordError = touched.password || submitted ? validatePassword(password) : null;

    const sendEmailCode = async () => {
        const { error } = await signUp.verifications.sendEmailCode();
        if (error) setFormError(getAuthErrorMessage(error));
        return !error;
    };

    const handleSignUp = async () => {
        setSubmitted(true);
        if (validateEmail(email) || validatePassword(password) || loading) return;
        setFormError(null);

        const { error } = await signUp.password({ emailAddress: email.trim(), password });
        if (error) {
            setFormError(getAuthErrorMessage(error));
            return;
        }

        if (await sendEmailCode()) setStep("verify");
    };

    const handleVerify = async (code: string) => {
        setFormError(null);
        const { error } = await signUp.verifications.verifyEmailCode({ code });
        if (error) {
            setFormError(getAuthErrorMessage(error));
            return;
        }

        if (signUp.status !== "complete") {
            setFormError("We couldn't finish creating your account. Please try again");
            return;
        }

        const { error: finalizeError } = await signUp.finalize({
            navigate: ({ session }) => {
                if (session?.currentTask) {
                    setFormError("Your account needs one more step before you can continue");
                    return;
                }
                router.replace("/");
            },
        });
        if (finalizeError) setFormError(getAuthErrorMessage(finalizeError));
    };

    const handleChangeEmail = () => {
        setFormError(null);
        setStep("details");
    };

    if (step === "verify") {
        return (
            <AuthShell title="Check your email" subtitle="Enter the code to confirm your email and finish setting up">
                <VerifyCodeForm
                    email={email.trim()}
                    loading={loading}
                    formError={formError}
                    submitLabel="Verify and continue"
                    backLabel="Change email"
                    onSubmit={handleVerify}
                    onResend={async () => {
                        setFormError(null);
                        return sendEmailCode();
                    }}
                    onBack={handleChangeEmail}
                />
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="Track every renewal and never pay for a forgotten subscription"
            footer={
                <View className="auth-link-row">
                    <Text className="auth-link-copy">Already have an account?</Text>
                    <Link href="/(auth)/sign-in" replace>
                        <Text className="auth-link">Sign in</Text>
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
                    textContentType="emailAddress"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    submitBehavior="submit"
                />

                <AuthField
                    ref={passwordRef}
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                    error={passwordError}
                    helper={`At least ${PASSWORD_MIN_LENGTH} characters`}
                    secureToggle
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    passwordRules={`minlength: ${PASSWORD_MIN_LENGTH};`}
                    returnKeyType="go"
                    onSubmitEditing={handleSignUp}
                />

                {formError && <Text className="auth-error" accessibilityLiveRegion="polite">{formError}</Text>}

                <AuthButton label="Create account" onPress={handleSignUp} loading={loading} />
            </View>
        </AuthShell>
    );
};

export default SignUp;
