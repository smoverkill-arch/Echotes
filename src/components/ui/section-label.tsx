import { StyleSheet, Text } from "react-native";

import { useAppearancePalette } from "../../stores/appearance-store";
import { fontFamily } from "../../theme/fonts";
import { typography } from "../../theme/tokens";

interface SectionLabelProps {
  children: string;
  tone?: "muted" | "primary" | "note" | "task";
  testID?: string;
}

export function SectionLabel({ children, tone = "muted", testID }: SectionLabelProps) {
  const palette = useAppearancePalette();
  const color =
    tone === "primary"
      ? palette.primary
      : tone === "note"
        ? palette.note
        : tone === "task"
          ? palette.task
          : palette.textSubtle;

  return (
    <Text style={[styles.label, { color }]} testID={testID}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.eyebrow,
    fontFamily: fontFamily.bodyBold,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
});
