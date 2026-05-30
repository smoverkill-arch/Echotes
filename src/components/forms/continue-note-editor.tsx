import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { buildContinueNoteBrief } from "../../features/notes/utils/build-continue-note-brief";
import { fontFamily } from "../../theme/fonts";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { ContinueNoteInput, Note } from "../../types/note";
import {
  addDaysToDayKey,
  formatDisplayDay,
  getTodayDateKey,
  parseDayKey,
} from "../../utils/date";

interface ContinueNoteEditorProps {
  visible: boolean;
  selectedDay: string;
  sourceNote: Note | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (input: ContinueNoteInput) => Promise<void> | void;
}

export function ContinueNoteEditor({
  visible,
  selectedDay,
  sourceNote,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: ContinueNoteEditorProps) {
  const generatedDefaultBrief = useMemo(
    () => (sourceNote ? buildContinueNoteBrief(sourceNote) : ""),
    [sourceNote],
  );
  const [title, setTitle] = useState("");
  const [newNoteDay, setNewNoteDay] = useState(selectedDay);
  const [generatedBrief, setGeneratedBrief] = useState("");
  const [content, setContent] = useState("");
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(sourceNote?.title ?? "");
    setNewNoteDay(selectedDay);
    setGeneratedBrief(generatedDefaultBrief);
    setContent("");
    setLocalErrorMessage(null);
  }, [generatedDefaultBrief, selectedDay, sourceNote, visible]);

  if (!visible || !sourceNote) {
    return null;
  }

  const updateNewNoteDay = (nextDay: string) => {
    setNewNoteDay(nextDay);
    setLocalErrorMessage(null);
  };

  const shiftNewNoteDay = (amount: number) => {
    try {
      updateNewNoteDay(addDaysToDayKey(newNoteDay, amount));
    } catch {
      setLocalErrorMessage("Dia da nova nota invalido. Use YYYY-MM-DD.");
    }
  };

  const isNewNoteDayBeforeOriginal = (() => {
    try {
      parseDayKey(newNoteDay);
      return newNoteDay < sourceNote.day;
    } catch {
      return false;
    }
  })();

  const handleSubmit = async () => {
    setLocalErrorMessage(null);

    if (!title.trim()) {
      setLocalErrorMessage("Titulo e obrigatorio.");
      return;
    }

    if (!generatedBrief.trim()) {
      setLocalErrorMessage("Briefing gerado e obrigatorio.");
      return;
    }

    try {
      parseDayKey(newNoteDay);
    } catch {
      setLocalErrorMessage("Dia da nova nota invalido. Use YYYY-MM-DD.");
      return;
    }

    if (newNoteDay < sourceNote.day) {
      setLocalErrorMessage("O dia da nota nao pode ser anterior ao dia original.");
      return;
    }

    await onSubmit({
      sourceNoteId: sourceNote.id,
      newNoteDay,
      title,
      generatedBrief,
      content,
    });
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Continuar desta nota</Text>
              <Text numberOfLines={2} style={styles.title}>
                {sourceNote.title}
              </Text>
              <View style={styles.originRow}>
                <Text style={styles.originLabel}>Dia original</Text>
                <Text style={styles.originChip}>{formatDisplayDay(sourceNote.day)}</Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Fechar continuidade"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && !isSubmitting ? styles.closeButtonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="continue-note-close-button"
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
              placeholder="Titulo da nova nota"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              testID="continue-note-title-input"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setLocalErrorMessage(null);
              }}
            />

            <Text style={styles.label}>Dia da nova nota</Text>
            <View style={styles.dayControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.dayControlButton,
                  pressed && !isSubmitting ? styles.buttonPressed : null,
                  isSubmitting ? styles.disabledButton : null,
                ]}
                testID="continue-note-previous-day-button"
                onPress={() => {
                  shiftNewNoteDay(-1);
                }}
              >
                <Text style={styles.dayControlLabel}>Dia anterior</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.dayControlButton,
                  pressed && !isSubmitting ? styles.buttonPressed : null,
                  isSubmitting ? styles.disabledButton : null,
                ]}
                testID="continue-note-next-day-button"
                onPress={() => {
                  shiftNewNoteDay(1);
                }}
              >
                <Text style={styles.dayControlLabel}>Dia seguinte</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.dayControlButton,
                  styles.todayButton,
                  pressed && !isSubmitting ? styles.todayButtonPressed : null,
                  isSubmitting ? styles.disabledButton : null,
                ]}
                testID="continue-note-today-button"
                onPress={() => {
                  updateNewNoteDay(getTodayDateKey());
                }}
              >
                <Text style={[styles.dayControlLabel, styles.todayButtonLabel]}>Hoje</Text>
              </Pressable>
            </View>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              testID="continue-note-day-input"
              value={newNoteDay}
              onChangeText={updateNewNoteDay}
            />
            {isNewNoteDayBeforeOriginal ? (
              <View style={styles.warningBlock} testID="continue-note-before-origin-warning">
                <Text style={styles.warningTitle}>Dia anterior ao original</Text>
                <Text style={styles.warningText}>
                  A continuidade precisa ficar no mesmo dia ou depois da nota de origem.
                </Text>
              </View>
            ) : null}

            <Text style={styles.label}>Briefing</Text>
            <TextInput
              multiline
              placeholder="Resumo gerado"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.multiline]}
              testID="continue-note-brief-input"
              value={generatedBrief}
              onChangeText={(value) => {
                setGeneratedBrief(value);
                setLocalErrorMessage(null);
              }}
            />

            <Text style={styles.label}>Conteudo</Text>
            <TextInput
              multiline
              placeholder="Escreva a continuidade"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.multiline]}
              testID="continue-note-content-input"
              value={content}
              onChangeText={setContent}
            />

            {localErrorMessage || errorMessage ? (
              <View
                accessibilityRole="alert"
                style={styles.errorBlock}
                testID="continue-note-error"
              >
                <Text style={styles.errorTitle}>Nao foi possivel continuar</Text>
                <Text style={styles.errorText}>{localErrorMessage ?? errorMessage}</Text>
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
              testID="continue-note-cancel-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              accessibilityState={{ disabled: isSubmitting }}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !isSubmitting ? styles.primaryButtonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="continue-note-submit-button"
              onPress={() => {
                void handleSubmit();
              }}
            >
              <Text style={styles.primaryLabel}>
                {isSubmitting ? "Salvando..." : "Criar continuidade"}
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
    maxHeight: "94%",
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
    color: colors.primary,
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
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.primary,
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
  dayControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayControlButton: {
    minHeight: touchTarget.min,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  dayControlLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  todayButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  todayButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  todayButtonLabel: {
    color: colors.primary,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  warningBlock: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
  },
  warningTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.danger,
  },
  warningText: {
    marginTop: spacing.xxs,
    fontSize: typography.body,
    fontFamily: fontFamily.body,
    color: colors.danger,
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
