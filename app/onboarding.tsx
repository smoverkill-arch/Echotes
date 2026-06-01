import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "../src/components/brand/brand-mark";
import { PrimaryAction } from "../src/components/ui/primary-action";
import { SecondaryAction } from "../src/components/ui/secondary-action";
import { SectionLabel } from "../src/components/ui/section-label";
import { useAppearancePalette } from "../src/stores/appearance-store";
import { useOnboardingStore } from "../src/stores/onboarding-store";
import { fontFamily } from "../src/theme/fonts";
import { spacing, typography } from "../src/theme/tokens";

interface Panel {
  eyebrow: string;
  title: string;
  body: string;
  tone: "primary" | "note" | "task";
}

const PANELS: Panel[] = [
  {
    eyebrow: "O dia no centro",
    title: "Cada dia e a sua superficie de trabalho",
    body: "Navegue pelos dias e veja tudo o que importa em uma timeline unica e calma.",
    tone: "primary",
  },
  {
    eyebrow: "Notas e Ecos",
    title: "Conecte ideias com Ecos",
    body: "Registre notas do dia e ligue-as entre si. Continue uma nota em outro dia sem perder o fio.",
    tone: "note",
  },
  {
    eyebrow: "Tarefas e projecao",
    title: "Projete acoes no tempo",
    body: "Crie tarefas, agende horarios e projete-as para dias futuros com clareza.",
    tone: "task",
  },
];

export default function OnboardingRoute() {
  const palette = useAppearancePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const setSeen = useOnboardingStore((state) => state.setSeen);
  const [page, setPage] = useState(0);

  const isLast = page === PANELS.length - 1;

  const finish = () => {
    setSeen();
    router.replace("/");
  };

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    pagerRef.current?.setPage(page + 1);
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: palette.background, paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.brandRow}>
        <BrandMark size="md" />
        <SecondaryAction
          label="Pular"
          onPress={finish}
          accessibilityLabel="Pular onboarding"
          testID="onboarding-skip-button"
        />
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {PANELS.map((panel, index) => (
          <View key={panel.eyebrow} style={styles.page} testID={`onboarding-panel-${index}`}>
            <SectionLabel tone={panel.tone}>{panel.eyebrow}</SectionLabel>
            <Text style={[styles.title, { color: palette.text }]}>{panel.title}</Text>
            <Text style={[styles.body, { color: palette.textMuted }]}>{panel.body}</Text>
          </View>
        ))}
      </PagerView>

      <View style={styles.dots}>
        {PANELS.map((panel, index) => (
          <View
            key={panel.eyebrow}
            style={[
              styles.dot,
              {
                backgroundColor: index === page ? palette.primary : palette.border,
                width: index === page ? 22 : 8,
              },
            ]}
          />
        ))}
      </View>

      <PrimaryAction
        label={isLast ? "Comecar" : "Proximo"}
        onPress={goNext}
        accessibilityLabel={isLast ? "Comecar a usar o Echotes" : "Proximo painel"}
        testID="onboarding-next-button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontFamily: fontFamily.display,
  },
  body: {
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    fontFamily: fontFamily.body,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
