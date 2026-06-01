import { Pressable, StyleSheet, Text } from "react-native";

import { useAppearancePalette } from "../../stores/appearance-store";
import { fontFamily } from "../../theme/fonts";
import { radius, spacing, touchTarget, typography } from "../../theme/tokens";

interface SecondaryActionProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "neutral" | "danger";
  accessibilityLabel?: string;
  testID?: string;
}

export function SecondaryAction({
  label,
  onPress,
  disabled = false,
  tone = "neutral",
  accessibilityLabel,
  testID,
}: SecondaryActionProps) {
  const palette = useAppearancePalette();
  const borderColor = tone === "danger" ? palette.danger : palette.border;
  const labelColor = tone === "danger" ? palette.danger : palette.text;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor,
          backgroundColor: pressed ? palette.surfacePressed : "transparent",
          opacity: disabled ? 0.55 : 1,
        },
      ]}
      testID={testID}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
  },
});
