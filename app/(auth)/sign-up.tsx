import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AuthErrorBanner } from "../../src/components/auth/auth-error-banner";
import { AuthForm } from "../../src/components/auth/auth-form";
import { signUp } from "../../src/features/auth/api/sign-up";
import { useAuthSession } from "../../src/features/auth/hooks/use-auth-session";

export default function SignUpRoute() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    authStatus,
    errorMessage,
    isAuthenticated,
    isBootstrapping,
    protectedDayHref,
    signInHref,
  } = useAuthSession();

  if (isAuthenticated) {
    return <Redirect href={protectedDayHref} />;
  }

  if (isBootstrapping) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#111827" />
        <Text style={styles.loadingText}>Preparando o fluxo de cadastro...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AuthErrorBanner message={errorMessage} status={authStatus} />

      <AuthForm
        mode="sign-up"
        isDisabled={authStatus === "config_error"}
        isSubmitting={isSubmitting || authStatus === "authenticating"}
        onSecondaryAction={() => {
          router.push(signInHref);
        }}
        onSubmit={async (credentials) => {
          setIsSubmitting(true);

          try {
            await signUp(credentials);
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
