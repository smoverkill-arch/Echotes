import { Pressable, StyleSheet, Text, View } from "react-native";

interface TimelinePlusButtonProps {
  onCreateNote: () => void;
  onCreateTask: () => void;
  isDisabled?: boolean;
}

export function TimelinePlusButton({
  onCreateNote,
  onCreateTask,
  isDisabled = false,
}: TimelinePlusButtonProps) {
  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        <Pressable
          accessibilityRole="button"
          disabled={isDisabled}
          style={({ pressed }) => [
            styles.option,
            pressed && !isDisabled ? styles.optionPressed : null,
          ]}
          testID="timeline-create-note-button"
          onPress={onCreateNote}
        >
          <Text style={styles.optionLabel}>Criar nota</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isDisabled}
          style={({ pressed }) => [
            styles.option,
            pressed && !isDisabled ? styles.optionPressed : null,
          ]}
          testID="timeline-create-task-button"
          onPress={onCreateTask}
        >
          <Text style={styles.optionLabel}>Criar tarefa</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          isDisabled ? styles.buttonDisabled : null,
          pressed && !isDisabled ? styles.buttonPressed : null,
        ]}
        testID="timeline-plus-button"
        onPress={() => undefined}
      >
        <Text style={styles.buttonLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
  },
  menu: {
    marginBottom: 12,
    gap: 8,
  },
  option: {
    minWidth: 168,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonLabel: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "600",
    color: "#ffffff",
  },
});
