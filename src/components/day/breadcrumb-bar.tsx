import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontFamily,
  letterSpacing,
  lineHeight,
  radius,
  spacing,
  touchTarget,
  typography,
} from "../../theme/tokens";
import { formatDisplayDay } from "../../utils/date";

interface BreadcrumbBarProps {
  sourceDate: string;
  destinationDate: string;
  onReturn: () => void;
}

export function BreadcrumbBar({
  sourceDate,
  destinationDate,
  onReturn,
}: BreadcrumbBarProps) {
  const formattedSourceDate = formatDisplayDay(sourceDate);
  const formattedDestinationDate = formatDisplayDay(destinationDate);

  return (
    <View style={styles.container} testID="breadcrumb-bar">
      <View style={styles.copyBlock}>
        <Text style={styles.eyebrow}>Contexto temporal</Text>
        <Text style={styles.title}>Item real em {formattedDestinationDate}</Text>
        <Text style={styles.body}>Criada em {formattedSourceDate}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          pressed ? styles.buttonPressed : null,
        ]}
        testID="breadcrumb-return-button"
        onPress={onReturn}
      >
        <Text style={styles.buttonLabel}>← {formattedSourceDate}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.noteBorder,
    backgroundColor: colors.noteSoft,
    padding: spacing.lg,
  },
  copyBlock: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wider,
    color: colors.note,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    marginTop: spacing.sm,
    fontSize: typography.bodyLarge,
    lineHeight: typography.bodyLarge * lineHeight.snug,
    color: colors.text,
  },
  body: {
    fontFamily: fontFamily.bodyRegular,
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  button: {
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text,
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: typography.caption,
    color: colors.white,
  },
});
