import { act } from "@testing-library/react-native";

import { useOnboardingStore } from "../../../src/stores/onboarding-store";

describe("onboarding-store", () => {
  beforeEach(() => {
    useOnboardingStore.setState({ hasSeen: false, hasHydrated: false });
  });

  // @req UI-ONBOARDING-001
  it("inicia como nao visto e persiste apos setSeen", () => {
    expect(useOnboardingStore.getState().hasSeen).toBe(false);

    act(() => {
      useOnboardingStore.getState().setSeen();
    });

    expect(useOnboardingStore.getState().hasSeen).toBe(true);
  });

  // @req UI-ONBOARDING-001
  it("marca hidratacao explicitamente", () => {
    act(() => {
      useOnboardingStore.getState().markHydrated();
    });

    expect(useOnboardingStore.getState().hasHydrated).toBe(true);
  });
});
