import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { listNoteCandidates } from "../../features/notes/api/list-note-candidates";
import { fontFamily } from "../../theme/fonts";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
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

const getCandidateContextLabel = (
  sourceNote: Note,
  candidate: NoteEchoCandidate,
) => (candidate.day === sourceNote.day ? "Mesmo dia" : "Outro dia");

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
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>Adicionar eco</Text>
              <Text style={styles.title}>{sourceNote.title}</Text>
              <View style={styles.originRow}>
                <Text style={styles.originChip}>{formatDisplayDay(sourceNote.day)}</Text>
                <Text style={styles.originText}>Nota de origem</Text>
              </View>
            </View>
            <Pressable
              accessibilityLabel="Fechar seletor de eco"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.closeButtonPressed : null,
              ]}
              testID="note-echo-picker-close-button"
              onPress={onClose}
            >
              <Text style={styles.closeLabel}>X</Text>
            </Pressable>
          </View>

          {errorMessage ? (
            <View
              accessibilityRole="alert"
              style={styles.feedbackBoxError}
              testID="note-echo-picker-error"
            >
              <Text style={styles.feedbackTitle}>Nao foi possivel carregar</Text>
              <Text style={styles.feedbackBody}>{errorMessage}</Text>
            </View>
          ) : null}

          <ScrollView contentContainerStyle={styles.list}>
            {items.length === 0 && isLoading ? (
              <View style={styles.feedbackBox} testID="note-echo-picker-loading">
                <Text style={styles.feedbackTitle}>Carregando candidatas</Text>
                <Text style={styles.feedbackBody}>
                  Buscando notas recentes para conectar.
                </Text>
              </View>
            ) : null}

            {items.length === 0 && !isLoading && !errorMessage ? (
              <View style={styles.feedbackBox} testID="note-echo-picker-empty">
                <Text style={styles.feedbackTitle}>Nenhuma candidata disponivel</Text>
                <Text style={styles.feedbackBody}>
                  Crie mais notas para ligar esta ideia a outro contexto.
                </Text>
              </View>
            ) : null}

            {items.map((candidate) => {
              const isDisabled = candidate.isAlreadyConnected;
              const contextLabel = getCandidateContextLabel(sourceNote, candidate);

              return (
                <Pressable
                  accessibilityLabel={`${candidate.title}. ${contextLabel}${
                    isDisabled ? ". Eco ja existe" : ""
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isDisabled }}
                  disabled={isDisabled}
                  key={candidate.id}
                  style={({ pressed }) => [
                    styles.candidateButton,
                    isDisabled ? styles.disabledCandidate : null,
                    pressed && !isDisabled ? styles.candidateButtonPressed : null,
                  ]}
                  testID={`note-echo-candidate-${candidate.id}`}
                  onPress={() => {
                    void onSelectCandidate(candidate);
                  }}
                >
                  <View style={styles.candidateTextGroup}>
                    <View style={styles.candidateMetaRow}>
                      <Text
                        style={[
                          styles.candidateChip,
                          contextLabel === "Outro dia" ? styles.candidateChipOtherDay : null,
                        ]}
                        testID={`note-echo-candidate-chip-${candidate.id}`}
                      >
                        {contextLabel}
                      </Text>
                      <Text style={styles.candidateDay}>
                        {formatDisplayDay(candidate.day)}
                      </Text>
                    </View>
                    <Text style={styles.candidateTitle}>{candidate.title}</Text>
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
            <View style={styles.footer}>
              <Pressable
                accessibilityLabel={
                  isLoading ? "Carregando mais candidatas" : "Carregar mais candidatas"
                }
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading }}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.loadMoreButton,
                  isLoading ? styles.loadMoreButtonDisabled : null,
                  pressed && !isLoading ? styles.loadMoreButtonPressed : null,
                ]}
                testID="note-echo-picker-load-more-button"
                onPress={() => {
                  void loadPage(nextCursor);
                }}
              >
                <Text
                  style={[
                    styles.loadMoreLabel,
                    isLoading ? styles.loadMoreLabelDisabled : null,
                  ]}
                >
                  {isLoading ? "Carregando..." : "Carregar mais"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23, 33, 27, 0.48)",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontFamily: fontFamily.bodyBold,
    textTransform: "uppercase",
    letterSpacing: 0,
    color: colors.note,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.display,
    color: colors.text,
  },
  originRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  originChip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.noteSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.note,
  },
  originText: {
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  closeButton: {
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  closeLabel: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  feedbackBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  feedbackBoxError: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
  },
  feedbackTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  feedbackBody: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  list: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  candidateButton: {
    minHeight: 84,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
  },
  candidateButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  disabledCandidate: {
    opacity: 0.68,
  },
  candidateTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  candidateMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  candidateChip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.primary,
  },
  candidateChipOtherDay: {
    backgroundColor: colors.noteSoft,
    color: colors.note,
  },
  candidateDay: {
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  candidateTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  candidateBrief: {
    fontSize: typography.caption,
    lineHeight: 18,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  disabledLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.textMuted,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  loadMoreButton: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  loadMoreButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  loadMoreButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  loadMoreLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  loadMoreLabelDisabled: {
    color: colors.textSubtle,
  },
});
