import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { Note } from "../../types/note";
import { formatDisplayDay } from "../../utils/date";

interface NoteReaderProps {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit: () => void;
}

export function NoteReader({
  visible,
  note,
  onClose,
  onEdit,
}: NoteReaderProps) {
  if (!visible || !note) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>Reader de nota</Text>
          <Text style={styles.title}>{note.title}</Text>
          <Text style={styles.meta}>Dia: {formatDisplayDay(note.day)}</Text>
          {note.brief ? <Text style={styles.brief}>{note.brief}</Text> : null}
          {note.content ? <Text style={styles.body}>{note.content}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              testID="note-reader-close-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Fechar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              testID="note-reader-edit-button"
              onPress={onEdit}
            >
              <Text style={styles.primaryLabel}>Editar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    padding: 24,
  },
  sheet: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#6b7280",
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: "#4b5563",
  },
  brief: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
  },
  body: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#1f2937",
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
