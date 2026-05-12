import { useEffect, useState } from "react";
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
import { updateNote } from "../../features/notes/api/update-note";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { Note } from "../../types/note";
import { formatDisplayDay } from "../../utils/date";

interface NoteEditorProps {
  visible: boolean;
  mode: "create" | "edit";
  selectedDay: string;
  note: Note | null;
  onClose: () => void;
  onSaved: (note: Note) => Promise<void> | void;
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

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setBrief(note?.brief ?? "");
    setErrorMessage(null);
  }, [note, visible]);

  if (!visible) {
    return null;
  }

  const editorDay = mode === "edit" && note ? note.day : selectedDay;
  const titleLabel = mode === "create" ? "Criar nota" : "Editar nota";

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

        await onSaved(result.note);
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
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
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
    fontWeight: "800",
    color: colors.note,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.title,
    fontWeight: "800",
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
    fontWeight: "700",
    color: colors.textMuted,
  },
  originChip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.noteSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontWeight: "800",
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
    fontWeight: "800",
    color: colors.text,
  },
  body: {
    marginTop: spacing.lg,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.body,
    fontWeight: "800",
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
    fontWeight: "800",
    color: colors.danger,
  },
  errorText: {
    marginTop: spacing.xxs,
    fontSize: typography.body,
    color: colors.danger,
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
    fontWeight: "700",
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
    fontWeight: "700",
    color: colors.white,
  },
  buttonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
