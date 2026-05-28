import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppearancePalette } from "../../stores/appearance-store";
import { radius, spacing, typography } from "../../theme/tokens";
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
  const palette = useAppearancePalette();
  const formattedSourceDate = formatDisplayDay(sourceDate);
  const formattedDestinationDate = formatDisplayDay(destinationDate);

  return (
    <View
      style={[
        styles.container,
        { borderColor: palette.primary, backgroundColor: palette.primarySoft },
      ]}
      testID="breadcrumb-bar"
    >
      <View style={styles.copyBlock}>
        <Text style={[styles.eyebrow, { color: palette.primary }]}>
          Contexto temporal
        </Text>
        <Text style={[styles.title, { color: palette.text }]}>
          Item real em {formattedDestinationDate}
        </Text>
        <Text style={[styles.body, { color: palette.textMuted }]}>
          Criada em {formattedSourceDate}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? palette.primaryPressed : palette.primary },
        ]}
        testID="breadcrumb-return-button"
        onPress={onReturn}
      >
        <Text style={[styles.buttonLabel, { color: palette.primaryText }]}>
          Voltar para {formattedSourceDate}
        </Text>
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
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  copyBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    fontWeight: "800",
  },
  body: {
    marginTop: spacing.xxs,
    fontSize: typography.caption,
  },
  button: {
    minHeight: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    paddingHorizontal: spacing.md,
  },
  buttonLabel: {
    fontSize: typography.caption,
    fontWeight: "800",
  },
});
