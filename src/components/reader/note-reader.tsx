import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fontFamily } from "../../theme/fonts";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
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
  onRemoveEcho?: (relatedNote: RelatedNote) => void;
  onContinueNote?: () => void;
  echoFeedbackMessage?: string | null;
}

const getRelationContextLabel = (note: Note, relatedNote: RelatedNote) => {
  if (relatedNote.availability !== "available") {
    return "Indisponivel";
  }

  return relatedNote.day === note.day ? "Mesmo dia" : "Outro dia";
};

const getRelationKindLabel = (relatedNote: RelatedNote) =>
  relatedNote.kind === "continue_note" ? "Continuacao" : "Eco manual";

export function NoteReader({
  visible,
  note,
  relatedNotes = [],
  onClose,
  onEdit,
  onOpenRelatedNote,
  onReloadRelatedNote,
  onAddEcho,
  onRemoveEcho,
  onContinueNote,
  echoFeedbackMessage = null,
}: NoteReaderProps) {
  if (!visible || !note) {
    return null;
  }

  const echoCountLabel =
    relatedNotes.length === 1 ? "1 nota conectada" : `${relatedNotes.length} notas conectadas`;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleBlock}>
                <Text style={styles.eyebrow}>Reader de nota</Text>
                <Text style={styles.title}>{note.title}</Text>
                <View style={styles.noteMetaRow}>
                  <Text style={styles.noteDateChip}>{formatDisplayDay(note.day)}</Text>
                  <Text style={styles.noteMetaText}>Reader contextual do dia</Text>
                </View>
              </View>
            </View>

            {note.brief ? <Text style={styles.brief}>{note.brief}</Text> : null}
            {note.content ? <Text style={styles.body}>{note.content}</Text> : null}

            <View style={styles.primaryActionArea}>
              {onContinueNote ? (
                <Pressable
                  accessibilityLabel="Continuar desta nota"
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.continueButton,
                    pressed ? styles.continueButtonPressed : null,
                  ]}
                  testID="note-reader-continue-note-button"
                  onPress={onContinueNote}
                >
                  <Text style={styles.continueLabel}>Continuar desta nota</Text>
                </Pressable>
              ) : null}

              <View style={styles.secondaryActions}>
                {onAddEcho ? (
                  <Pressable
                    accessibilityLabel="Adicionar eco manual"
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      pressed ? styles.secondaryButtonPressed : null,
                    ]}
                    testID="note-reader-add-echo-button"
                    onPress={onAddEcho}
                  >
                    <Text style={styles.secondaryLabel}>Adicionar eco</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  accessibilityLabel="Editar nota"
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed ? styles.secondaryButtonPressed : null,
                  ]}
                  testID="note-reader-edit-button"
                  onPress={onEdit}
                >
                  <Text style={styles.secondaryLabel}>Editar</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.echoSectionDivider} testID="note-reader-echo-section-divider" />

            <View style={styles.echoSection} testID="note-reader-echo-section">
              <View style={styles.echoHeader}>
                <View>
                  <Text style={styles.echoTitle}>Ecos</Text>
                  <Text style={styles.echoSubtitle}>{echoCountLabel}</Text>
                </View>
              </View>

              {echoFeedbackMessage ? (
                <Text style={styles.echoFeedbackText}>{echoFeedbackMessage}</Text>
              ) : null}

              {relatedNotes.length === 0 ? (
                <View style={styles.emptyEchoBox}>
                  <Text style={styles.emptyEchoTitle}>Nenhuma nota conectada</Text>
                  <Text style={styles.emptyEchoText}>
                    Use Adicionar eco para ligar esta nota a outra ideia.
                  </Text>
                </View>
              ) : (
                relatedNotes.map((relatedNote) => {
                  const isAvailable = relatedNote.availability === "available";
                  const relationContext = getRelationContextLabel(note, relatedNote);

                  return (
                    <View
                      key={`${relatedNote.echoId}:${relatedNote.id}`}
                      style={[
                        styles.relatedNoteItem,
                        !isAvailable ? styles.relatedNoteItemUnavailable : null,
                      ]}
                      testID={`note-reader-related-note-${relatedNote.id}`}
                    >
                      <View style={styles.relatedMetaRow}>
                        <Text
                          style={[
                            styles.relationChip,
                            relationContext === "Outro dia" ? styles.relationChipOtherDay : null,
                            relationContext === "Indisponivel"
                              ? styles.relationChipUnavailable
                              : null,
                          ]}
                          testID={`note-reader-relation-chip-${relatedNote.id}`}
                        >
                          {relationContext}
                        </Text>
                        <Text style={styles.relationKind}>
                          {getRelationKindLabel(relatedNote)}
                        </Text>
                      </View>

                      {isAvailable ? (
                        <>
                          <Pressable
                            accessibilityLabel={`Abrir nota conectada ${relatedNote.title}`}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                              styles.relatedOpenButton,
                              pressed ? styles.relatedOpenButtonPressed : null,
                            ]}
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

                          {onRemoveEcho ? (
                            <Pressable
                              accessibilityLabel={`Remover eco com ${relatedNote.title}`}
                              accessibilityRole="button"
                              style={({ pressed }) => [
                                styles.removeEchoButton,
                                pressed ? styles.removeEchoButtonPressed : null,
                              ]}
                              testID={`note-reader-remove-echo-${relatedNote.echoId}`}
                              onPress={() => {
                                Alert.alert(
                                  "Remover eco",
                                  "Remover esta relacao entre notas?",
                                  [
                                    { text: "Cancelar", style: "cancel" },
                                    {
                                      text: "Remover eco",
                                      style: "destructive",
                                      onPress: () => {
                                        onRemoveEcho(relatedNote);
                                      },
                                    },
                                  ],
                                );
                              }}
                            >
                              <Text style={styles.removeEchoLabel}>Remover eco</Text>
                            </Pressable>
                          ) : null}
                        </>
                      ) : (
                        <View>
                          <Text style={styles.relatedTitle}>Item indisponivel</Text>
                          <Text style={styles.relatedMeta}>
                            Nao foi possivel carregar esta nota conectada.
                          </Text>
                          <Pressable
                            accessibilityLabel="Recarregar nota conectada"
                            accessibilityRole="button"
                            style={({ pressed }) => [
                              styles.reloadButton,
                              pressed ? styles.reloadButtonPressed : null,
                            ]}
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

          <View style={styles.footerActions}>
            <Pressable
              accessibilityLabel="Fechar Reader"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.closeButtonPressed : null,
              ]}
              testID="note-reader-close-button"
              onPress={onClose}
            >
              <Text style={styles.closeLabel}>Fechar</Text>
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
    backgroundColor: "rgba(23, 33, 27, 0.48)",
  },
  sheet: {
    maxHeight: "92%",
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  content: {
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleBlock: {
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
    fontSize: typography.title,
    fontFamily: fontFamily.display,
    color: colors.text,
  },
  noteMetaRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  noteDateChip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.noteSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.note,
  },
  noteMetaText: {
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  brief: {
    marginTop: spacing.lg,
    fontSize: typography.body,
    lineHeight: 20,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  body: {
    marginTop: spacing.md,
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    fontFamily: fontFamily.body,
    color: colors.text,
  },
  primaryActionArea: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  continueButton: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  continueButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  continueLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  secondaryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  secondaryButton: {
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  secondaryLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  echoSection: {
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  echoSectionDivider: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    height: 1,
    backgroundColor: colors.border,
  },
  echoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  echoTitle: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.display,
    color: colors.text,
  },
  echoSubtitle: {
    marginTop: spacing.xxs,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  emptyEchoBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    padding: spacing.md,
  },
  emptyEchoTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  emptyEchoText: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  relatedNoteItem: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  relatedNoteItemUnavailable: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
  },
  relatedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  relationChip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.primary,
  },
  relationChipOtherDay: {
    backgroundColor: colors.noteSoft,
    color: colors.note,
  },
  relationChipUnavailable: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
  relationKind: {
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  relatedOpenButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
  },
  relatedOpenButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  relatedTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  relatedMeta: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  relatedBrief: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    lineHeight: 18,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  echoFeedbackText: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  removeEchoButton: {
    alignSelf: "flex-start",
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  removeEchoButtonPressed: {
    backgroundColor: colors.dangerSoft,
  },
  removeEchoLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.danger,
  },
  reloadButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  reloadButtonPressed: {
    backgroundColor: colors.surface,
  },
  reloadLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.danger,
  },
  footerActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  closeButton: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text,
    paddingHorizontal: spacing.lg,
  },
  closeButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  closeLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
});
