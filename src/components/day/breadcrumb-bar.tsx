import { Pressable, StyleSheet, Text, View } from "react-native";
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
        <Text style={styles.buttonLabel}>Voltar para {formattedSourceDate}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
    padding: 16,
  },
  copyBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#1d4ed8",
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  body: {
    marginTop: 6,
    fontSize: 14,
    color: "#475569",
  },
  button: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
