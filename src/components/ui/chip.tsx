import { StyleSheet, Text, View } from "react-native";

import { useAppearancePalette } from "../../stores/appearance-store";
import { fontFamily } from "../../theme/fonts";
import { radius, spacing, typography } from "../../theme/tokens";

type ChipTone = "neutral" | "primary" | "note" | "danger";

interface ChipProps {
  label: string;
  tone?: ChipTone;
  testID?: string;
}

export function Chip({ label, tone = "neutral", testID }: ChipProps) {
  const palette = useAppearancePalette();

  const toneStyle: Record<ChipTone, { bg: string; fg: string }> = {
    neutral: { bg: palette.surfaceMuted, fg: palette.textMuted },
    primary: { bg: palette.primarySoft, fg: palette.primary },
    note: { bg: palette.noteSoft, fg: palette.note },
    danger: { bg: palette.dangerSoft, fg: palette.danger },
  };

  const { bg, fg } = toneStyle[tone];

  return (
    <View style={[styles.chip, { backgroundColor: bg }]} testID={testID}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
  },
});
