import { Pressable, StyleSheet, Text } from "react-native";

import { useAppearancePalette } from "../../stores/appearance-store";
import { fontFamily } from "../../theme/fonts";
import { radius, spacing, touchTarget, typography } from "../../theme/tokens";

interface PrimaryActionProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export function PrimaryAction({
  label,
  onPress,
  disabled = false,
  accessibilityLabel,
  testID,
}: PrimaryActionProps) {
  const palette = useAppearancePalette();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? palette.disabled
            : pressed
              ? palette.primaryPressed
              : palette.primary,
        },
      ]}
      testID={testID}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: palette.primaryText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
  },
});
