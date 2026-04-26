import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AuthErrorBanner } from "../../src/components/auth/auth-error-banner";
import { AuthForm } from "../../src/components/auth/auth-form";
import { signIn } from "../../src/features/auth/api/sign-in";
import { useAuthSession } from "../../src/features/auth/hooks/use-auth-session";

export default function SignInRoute() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    authStatus,
    errorMessage,
    isAuthenticated,
    isBootstrapping,
    protectedDayHref,
    signUpHref,
  } = useAuthSession();

  if (isAuthenticated) {
    return <Redirect href={protectedDayHref} />;
  }

  if (isBootstrapping) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#111827" />
        <Text style={styles.loadingText}>Restaurando sua sessao...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AuthErrorBanner message={errorMessage} status={authStatus} />

      <AuthForm
        mode="sign-in"
        isDisabled={authStatus === "config_error"}
        isSubmitting={isSubmitting || authStatus === "authenticating"}
        onSecondaryAction={() => {
          router.push(signUpHref);
        }}
        onSubmit={async (credentials) => {
          setIsSubmitting(true);

          try {
            await signIn(credentials);
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#f7f8fb",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f7f8fb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#4b5563",
  },
});
