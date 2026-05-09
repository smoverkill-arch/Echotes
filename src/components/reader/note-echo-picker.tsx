import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { listNoteCandidates } from "../../features/notes/api/list-note-candidates";
import type {
  Note,
  NoteEcho,
  NoteEchoCandidate,
  NoteEchoCandidateCursor,
} from "../../types/note";
import { formatDisplayDay } from "../../utils/date";

interface NoteEchoPickerProps {
  visible: boolean;
  sourceNote: Note | null;
  selectedDay: string;
  existingEchoes: NoteEcho[];
  onClose: () => void;
  onSelectCandidate: (candidate: NoteEchoCandidate) => Promise<void> | void;
}

export function NoteEchoPicker({
  visible,
  sourceNote,
  selectedDay,
  existingEchoes,
  onClose,
  onSelectCandidate,
}: NoteEchoPickerProps) {
  const [items, setItems] = useState<NoteEchoCandidate[]>([]);
  const [nextCursor, setNextCursor] = useState<NoteEchoCandidateCursor | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPage = useCallback(
    async (cursor: NoteEchoCandidateCursor | null) => {
      if (!sourceNote) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const result = await listNoteCandidates({
        sourceNoteId: sourceNote.id,
        selectedDay,
        existingEchoes,
        cursor,
      });

      if (!result.ok) {
        setErrorMessage(result.errorMessage);
        setIsLoading(false);
        return;
      }

      setItems((currentItems) =>
        cursor ? [...currentItems, ...result.page.items] : result.page.items,
      );
      setNextCursor(result.page.nextCursor);
      setIsLoading(false);
    },
    [existingEchoes, selectedDay, sourceNote],
  );

  useEffect(() => {
    if (!visible || !sourceNote) {
      setItems([]);
      setNextCursor(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    void loadPage(null);
  }, [loadPage, sourceNote, visible]);

  if (!visible || !sourceNote) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Adicionar eco</Text>
              <Text style={styles.title}>{sourceNote.title}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              style={styles.closeButton}
              testID="note-echo-picker-close-button"
              onPress={onClose}
            >
              <Text style={styles.closeLabel}>Fechar</Text>
            </Pressable>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText} testID="note-echo-picker-error">
              {errorMessage}
            </Text>
          ) : null}

          <ScrollView contentContainerStyle={styles.list}>
            {items.length === 0 && !isLoading ? (
              <Text style={styles.emptyText}>Nenhuma candidata disponivel</Text>
            ) : null}

            {items.map((candidate) => {
              const isDisabled = candidate.isAlreadyConnected;

              return (
                <Pressable
                  accessibilityRole="button"
                  disabled={isDisabled}
                  key={candidate.id}
                  style={[
                    styles.candidateButton,
                    isDisabled ? styles.disabledCandidate : null,
                  ]}
                  testID={`note-echo-candidate-${candidate.id}`}
                  onPress={() => {
                    void onSelectCandidate(candidate);
                  }}
                >
                  <View style={styles.candidateTextGroup}>
                    <Text style={styles.candidateTitle}>{candidate.title}</Text>
                    <Text style={styles.candidateMeta}>
                      Dia da nota: {formatDisplayDay(candidate.day)}
                    </Text>
                    {candidate.brief ? (
                      <Text style={styles.candidateBrief}>{candidate.brief}</Text>
                    ) : null}
                  </View>
                  {isDisabled ? (
                    <Text style={styles.disabledLabel}>Eco ja existe</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {nextCursor ? (
            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              style={styles.loadMoreButton}
              testID="note-echo-picker-load-more-button"
              onPress={() => {
                void loadPage(nextCursor);
              }}
            >
              <Text style={styles.loadMoreLabel}>
                {isLoading ? "Carregando..." : "carregar mais"}
              </Text>
            </Pressable>
          ) : null}
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
    maxHeight: "84%",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#6b7280",
  },
  title: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  closeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: "#b91c1c",
  },
  list: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "#64748b",
  },
  candidateButton: {
    minHeight: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
  },
  disabledCandidate: {
    opacity: 0.62,
  },
  candidateTextGroup: {
    flex: 1,
  },
  candidateTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  candidateMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  candidateBrief: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#475569",
  },
  disabledLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  loadMoreButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  loadMoreLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
});
