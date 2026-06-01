import { render, screen } from "@testing-library/react-native";

import IndexRoute from "../../../app/index";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useOnboardingStore } from "../../../src/stores/onboarding-store";

jest.mock("expo-router", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, { testID: "redirect-target" }, String(href)),
  };
});

const setAuth = (overrides: Partial<ReturnType<typeof useAuthStore.getState>>) => {
  useAuthStore.setState({
    status: "unauthenticated",
    session: null,
    isAuthenticated: false,
    isRestoring: false,
    hasHydrated: true,
    errorMessage: null,
    ...overrides,
  });
};

describe("IndexRoute routing", () => {
  beforeEach(() => {
    useOnboardingStore.setState({ hasSeen: true, hasHydrated: true });
    setAuth({});
  });

  // @req UI-ONBOARDING-001
  it("envia para onboarding quando ainda nao foi visto", () => {
    useOnboardingStore.setState({ hasSeen: false, hasHydrated: true });
    render(<IndexRoute />);
    expect(screen.getByTestId("redirect-target").props.children).toBe("/onboarding");
  });

  // @req UI-ONBOARDING-001
  it("envia para home quando visto e autenticado", () => {
    setAuth({ isAuthenticated: true, status: "authenticated" });
    render(<IndexRoute />);
    expect(screen.getByTestId("redirect-target").props.children).toBe("/home");
  });

  // @req UI-ONBOARDING-001
  it("envia para sign-in quando visto e nao autenticado", () => {
    render(<IndexRoute />);
    expect(screen.getByTestId("redirect-target").props.children).toBe("/sign-in");
  });

  it("mostra loading enquanto onboarding nao hidratou", () => {
    useOnboardingStore.setState({ hasSeen: true, hasHydrated: false });
    render(<IndexRoute />);
    expect(screen.queryByTestId("redirect-target")).toBeNull();
  });
});
