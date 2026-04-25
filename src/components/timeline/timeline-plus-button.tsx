import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TimelinePlusButtonProps {
  isSheetOpen: boolean;
  onOpenSheet: () => void;
  onCloseSheet: () => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  isDisabled?: boolean;
}

export function TimelinePlusButton({
  isSheetOpen,
  onOpenSheet,
  onCloseSheet,
  onCreateNote,
  onCreateTask,
  isDisabled = false,
}: TimelinePlusButtonProps) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      {isSheetOpen ? (
        <View style={styles.sheetBackdrop} testID="timeline-plus-sheet-backdrop">
          <View collapsable={false} style={styles.sheet} testID="timeline-plus-sheet">
            <Text style={styles.sheetEyebrow}>Criar</Text>
            <Text style={styles.sheetTitle}>Escolha uma acao</Text>

            <View style={styles.menu}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.88}
                style={styles.option}
                testID="timeline-create-note-button"
                onPress={onCreateNote}
              >
                <Text style={styles.optionLabel}>Criar nota</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.88}
                style={styles.option}
                testID="timeline-create-task-button"
                onPress={onCreateTask}
              >
                <Text style={styles.optionLabel}>Criar tarefa</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.88}
              style={styles.cancelButton}
              testID="timeline-plus-cancel-button"
              onPress={onCloseSheet}
            >
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        accessibilityHint="Abre o menu de criacao de nota ou tarefa"
        accessibilityLabel="Abrir menu de criacao"
        accessibilityRole="button"
        activeOpacity={0.92}
        disabled={isDisabled}
        style={[styles.button, isDisabled ? styles.buttonDisabled : null]}
        testID="timeline-plus-button"
        onPress={onOpenSheet}
      >
        <Text style={styles.buttonLabel}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 4,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  sheetEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0,
    color: "#6b7280",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  menu: {
    gap: 8,
  },
  option: {
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelButton: {
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  cancelLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  button: {
    marginRight: 0,
    marginBottom: 0,
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
  buttonLabel: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "600",
    color: "#ffffff",
  },
});
