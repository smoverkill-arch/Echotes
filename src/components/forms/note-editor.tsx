import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createNote } from "../../features/notes/api/create-note";
import { createNoteEcho } from "../../features/notes/api/create-note-echo";
import { listNoteCandidates } from "../../features/notes/api/list-note-candidates";
import { updateNote } from "../../features/notes/api/update-note";
import { fontFamily } from "../../theme/fonts";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { Note, NoteEchoCandidate, NoteEchoCandidateCursor } from "../../types/note";
import { formatDisplayDay } from "../../utils/date";

interface NoteSavedOptions {
  openReader?: boolean;
  feedbackMessage?: string | null;
}

interface NoteEditorProps {
  visible: boolean;
  mode: "create" | "edit";
  selectedDay: string;
  note: Note | null;
  onClose: () => void;
  onSaved: (note: Note, options?: NoteSavedOptions) => Promise<void> | void;
}

export function NoteEditor({
  visible,
  mode,
  selectedDay,
  note,
  onClose,
  onSaved,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [brief, setBrief] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateItems, setCandidateItems] = useState<NoteEchoCandidate[]>([]);
  const [candidateNextCursor, setCandidateNextCursor] =
    useState<NoteEchoCandidateCursor | null>(null);
  const [selectedInitialEcho, setSelectedInitialEcho] =
    useState<NoteEchoCandidate | null>(null);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [candidateErrorMessage, setCandidateErrorMessage] = useState<string | null>(
    null,
  );

  const isCreateMode = mode === "create";

  const loadInitialEchoCandidates = useCallback(
    async (cursor: NoteEchoCandidateCursor | null = null) => {
      if (!visible || !isCreateMode) {
        return;
      }

      setIsLoadingCandidates(true);
      setCandidateErrorMessage(null);

      try {
        const result = await listNoteCandidates({
          sourceNoteId: null,
          selectedDay,
          existingEchoes: [],
          cursor,
          pageSize: 8,
        });

        if (!result.ok) {
          setCandidateErrorMessage(result.errorMessage);
          return;
        }

        setCandidateNextCursor(result.page.nextCursor);
        setCandidateItems((currentItems) =>
          cursor ? [...currentItems, ...result.page.items] : result.page.items,
        );
      } finally {
        setIsLoadingCandidates(false);
      }
    },
    [isCreateMode, selectedDay, visible],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setBrief(note?.brief ?? "");
    setErrorMessage(null);
    setSelectedInitialEcho(null);

    if (mode === "create") {
      setCandidateItems([]);
      setCandidateNextCursor(null);
      setCandidateErrorMessage(null);
      void loadInitialEchoCandidates();
    }
  }, [loadInitialEchoCandidates, mode, note, visible]);

  if (!visible) {
    return null;
  }

  const editorDay = mode === "edit" && note ? note.day : selectedDay;
  const titleLabel = mode === "create" ? "Criar nota" : "Editar nota";

  const persistCreatedNote = async () => {
    const result = await createNote({
      title,
      content,
      brief,
      day: selectedDay,
      tag_id: null,
      color: null,
      is_color_overridden: false,
    });

    if (!result.ok || !result.note) {
      setErrorMessage(result.errorMessage);
      return;
    }

    if (!selectedInitialEcho) {
      await onSaved(result.note, { openReader: true });
      return;
    }

    const echoResult = await createNoteEcho({
      from_note_id: result.note.id,
      to_note_id: selectedInitialEcho.id,
      context_note_id: result.note.id,
      context_day: selectedDay,
      kind: "manual_link",
      metadata: null,
    });

    if (!echoResult.ok) {
      await onSaved(result.note, {
        openReader: true,
        feedbackMessage: "Nota salva, mas o eco nao foi criado.",
      });
      return;
    }

    await onSaved(result.note, {
      openReader: true,
      feedbackMessage:
        echoResult.status === "already_exists" ? "Eco ja existe" : "Eco adicionado.",
    });
  };

  const persistEditedNote = async () => {
    if (!note) {
      setErrorMessage("Selecione uma nota valida para editar.");
      return;
    }

    const result = await updateNote(note, {
      title,
      content,
      brief,
      day: note.day,
      tag_id: note.tag_id,
      color: note.color,
      is_color_overridden: note.is_color_overridden,
    });

    if (!result.ok || !result.note) {
      setErrorMessage(result.errorMessage);
      return;
    }

    await onSaved(result.note);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (mode === "create") {
        await persistCreatedNote();
        return;
      }

      await persistEditedNote();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{titleLabel}</Text>
              <Text style={styles.title}>
                {mode === "create" ? "Nova nota do dia" : note?.title}
              </Text>
              <View style={styles.originRow}>
                <Text style={styles.originLabel}>Dia da nota</Text>
                <Text style={styles.originChip}>{formatDisplayDay(editorDay)}</Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Fechar editor de nota"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && !isSubmitting ? styles.closeButtonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="note-editor-close-button"
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.body}
          >
            <Text style={styles.label}>Titulo</Text>
            <TextInput
              placeholder="Titulo da nota"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              testID="note-editor-title-input"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setErrorMessage(null);
              }}
            />

            <Text style={styles.label}>Conteudo</Text>
            <TextInput
              multiline
              placeholder="Escreva sua nota"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.multiline]}
              testID="note-editor-content-input"
              value={content}
              onChangeText={(value) => {
                setContent(value);
                setErrorMessage(null);
              }}
            />

            <Text style={styles.label}>Briefing</Text>
            <TextInput
              multiline
              placeholder="Resumo opcional"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.multilineCompact]}
              testID="note-editor-brief-input"
              value={brief}
              onChangeText={(value) => {
                setBrief(value);
                setErrorMessage(null);
              }}
            />

            {isCreateMode ? (
              <View style={styles.initialEchoSection} testID="note-editor-initial-echo-section">
                <View style={styles.initialEchoHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Eco inicial</Text>
                    <Text style={styles.sectionSubtitle}>
                      Conecte esta nota a uma nota existente antes de salvar.
                    </Text>
                  </View>
                  {selectedInitialEcho ? (
                    <Pressable
                      accessibilityLabel="Remover eco inicial selecionado"
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.clearSelectionButton,
                        pressed ? styles.buttonPressed : null,
                      ]}
                      testID="note-editor-clear-initial-echo-button"
                      onPress={() => {
                        setSelectedInitialEcho(null);
                      }}
                    >
                      <Text style={styles.clearSelectionLabel}>Limpar</Text>
                    </Pressable>
                  ) : null}
                </View>

                {candidateErrorMessage ? (
                  <View
                    accessibilityRole="alert"
                    style={styles.candidateFeedbackBlock}
                    testID="note-editor-initial-echo-error"
                  >
                    <Text style={styles.errorTitle}>Nao foi possivel carregar ecos</Text>
                    <Text style={styles.errorText}>{candidateErrorMessage}</Text>
                  </View>
                ) : null}

                {!candidateErrorMessage && candidateItems.length === 0 && !isLoadingCandidates ? (
                  <View
                    style={styles.candidateFeedbackBlock}
                    testID="note-editor-initial-echo-empty"
                  >
                    <Text style={styles.emptyTitle}>Nenhuma candidata encontrada</Text>
                    <Text style={styles.emptyText}>
                      Salve a nota sem eco inicial ou volte depois para conectar.
                    </Text>
                  </View>
                ) : null}

                {candidateItems.map((candidate) => {
                  const isSelected = selectedInitialEcho?.id === candidate.id;
                  const contextLabel =
                    candidate.day === selectedDay ? "Mesmo dia" : "Outro dia";

                  return (
                    <Pressable
                      key={candidate.id}
                      accessibilityLabel={`Selecionar eco inicial ${candidate.title}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={({ pressed }) => [
                        styles.candidateItem,
                        isSelected ? styles.candidateItemSelected : null,
                        pressed ? styles.candidateItemPressed : null,
                      ]}
                      testID={`note-editor-initial-echo-candidate-${candidate.id}`}
                      onPress={() => {
                        setSelectedInitialEcho(isSelected ? null : candidate);
                        setErrorMessage(null);
                      }}
                    >
                      <View style={styles.candidateMetaRow}>
                        <Text
                          style={[
                            styles.contextChip,
                            contextLabel === "Outro dia" ? styles.contextChipOtherDay : null,
                          ]}
                        >
                          {contextLabel}
                        </Text>
                        <Text style={styles.candidateDay}>
                          {formatDisplayDay(candidate.day)}
                        </Text>
                      </View>
                      <Text style={styles.candidateTitle}>{candidate.title}</Text>
                      {candidate.brief ? (
                        <Text numberOfLines={2} style={styles.candidateBrief}>
                          {candidate.brief}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}

                {candidateNextCursor ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isLoadingCandidates }}
                    disabled={isLoadingCandidates}
                    style={({ pressed }) => [
                      styles.loadMoreButton,
                      pressed && !isLoadingCandidates ? styles.buttonPressed : null,
                      isLoadingCandidates ? styles.disabledButton : null,
                    ]}
                    testID="note-editor-initial-echo-load-more-button"
                    onPress={() => {
                      void loadInitialEchoCandidates(candidateNextCursor);
                    }}
                  >
                    <Text style={styles.loadMoreLabel}>
                      {isLoadingCandidates ? "Carregando..." : "Carregar mais"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {errorMessage ? (
              <View
                accessibilityRole="alert"
                style={styles.errorBlock}
                testID="note-editor-error"
              >
                <Text style={styles.errorTitle}>Nao foi possivel salvar</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && !isSubmitting ? styles.buttonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="note-editor-cancel-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !isSubmitting ? styles.primaryButtonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="note-editor-submit-button"
              onPress={() => {
                void handleSubmit();
              }}
            >
              <Text style={styles.primaryLabel}>
                {isSubmitting ? "Salvando..." : "Salvar nota"}
              </Text>
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(23, 33, 27, 0.45)",
  },
  sheet: {
    maxHeight: "92%",
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.note,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.title,
    fontFamily: fontFamily.display,
    color: colors.text,
  },
  originRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  originLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
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
  closeButton: {
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  closeButtonText: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  body: {
    marginTop: spacing.lg,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  input: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.body,
    color: colors.text,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  multilineCompact: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  errorBlock: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
  },
  errorTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.danger,
  },
  errorText: {
    marginTop: spacing.xxs,
    fontSize: typography.body,
    fontFamily: fontFamily.body,
    color: colors.danger,
  },
  initialEchoSection: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  initialEchoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.display,
    color: colors.text,
  },
  sectionSubtitle: {
    marginTop: spacing.xxs,
    fontSize: typography.caption,
    lineHeight: 18,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  clearSelectionButton: {
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  clearSelectionLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  candidateFeedbackBlock: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  emptyText: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  candidateItem: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
  },
  candidateItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  candidateItemPressed: {
    backgroundColor: colors.surfacePressed,
  },
  candidateMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  contextChip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.primary,
  },
  contextChipOtherDay: {
    backgroundColor: colors.noteSoft,
    color: colors.note,
  },
  candidateDay: {
    fontSize: typography.caption,
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
  loadMoreButton: {
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  loadMoreLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  secondaryLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  primaryButton: {
    flex: 1.25,
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  buttonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
