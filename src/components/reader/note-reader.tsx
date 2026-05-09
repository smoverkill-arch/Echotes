import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Note, RelatedNote } from "../../types/note";
import { formatDisplayDay } from "../../utils/date";

interface NoteReaderProps {
  visible: boolean;
  note: Note | null;
  relatedNotes?: RelatedNote[];
  onClose: () => void;
  onEdit: () => void;
  onOpenRelatedNote?: (relatedNote: RelatedNote) => void;
  onReloadRelatedNote?: () => void;
  onAddEcho?: () => void;
  // US2/T034 wires per-echo removal confirmation; Phase 3 only carries the hook.
  onRemoveEcho?: (relatedNote: RelatedNote) => void;
  onContinueNote?: () => void;
}

export function NoteReader({
  visible,
  note,
  relatedNotes = [],
  onClose,
  onEdit,
  onOpenRelatedNote,
  onReloadRelatedNote,
  onAddEcho,
  onContinueNote,
}: NoteReaderProps) {
  if (!visible || !note) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>Reader de nota</Text>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.meta}>Dia: {formatDisplayDay(note.day)}</Text>
            {note.brief ? <Text style={styles.brief}>{note.brief}</Text> : null}
            {note.content ? <Text style={styles.body}>{note.content}</Text> : null}

            <View style={styles.echoSection}>
              <View style={styles.echoHeader}>
                <Text style={styles.echoTitle}>Ecos</Text>
                <Pressable
                  accessibilityRole="button"
                  style={styles.echoActionButton}
                  testID="note-reader-add-echo-button"
                  onPress={onAddEcho}
                >
                  <Text style={styles.echoActionLabel}>Adicionar eco</Text>
                </Pressable>
              </View>

              {relatedNotes.length === 0 ? (
                <Text style={styles.emptyEchoText}>Nenhuma nota conectada</Text>
              ) : (
                relatedNotes.map((relatedNote) => {
                  const isAvailable = relatedNote.availability === "available";

                  return (
                    <View
                      key={`${relatedNote.echoId}:${relatedNote.id}`}
                      style={styles.relatedNoteItem}
                      testID={`note-reader-related-note-${relatedNote.id}`}
                    >
                      {isAvailable ? (
                        <Pressable
                          accessibilityRole="button"
                          testID={`note-reader-open-related-note-${relatedNote.id}`}
                          onPress={() => {
                            onOpenRelatedNote?.(relatedNote);
                          }}
                        >
                          <Text style={styles.relatedTitle}>{relatedNote.title}</Text>
                          <Text style={styles.relatedMeta}>
                            Dia da nota: {formatDisplayDay(relatedNote.day)}
                          </Text>
                          {relatedNote.brief ? (
                            <Text style={styles.relatedBrief}>{relatedNote.brief}</Text>
                          ) : null}
                        </Pressable>
                      ) : (
                        <View>
                          <Text style={styles.relatedTitle}>Item indisponivel</Text>
                          <Text style={styles.relatedMeta}>
                            Nao foi possivel carregar esta nota conectada.
                          </Text>
                          <Pressable
                            accessibilityRole="button"
                            style={styles.reloadButton}
                            testID={`note-reader-reload-related-note-${relatedNote.id}`}
                            onPress={() => {
                              onReloadRelatedNote?.();
                            }}
                          >
                            <Text style={styles.reloadLabel}>Recarregar</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              testID="note-reader-continue-note-button"
              onPress={onContinueNote}
            >
              <Text style={styles.secondaryLabel}>Continuar desta nota</Text>
            </Pressable>

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
    maxHeight: "88%",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  content: {
    paddingBottom: 6,
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
  echoSection: {
    marginTop: 18,
    gap: 10,
  },
  echoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  echoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  echoActionButton: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  echoActionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  emptyEchoText: {
    fontSize: 13,
    color: "#64748b",
  },
  relatedNoteItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    padding: 12,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  relatedMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  relatedBrief: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#475569",
  },
  reloadButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  reloadLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
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
