import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { buildContinueNoteBrief } from "../../features/notes/utils/build-continue-note-brief";
import type { ContinueNoteInput, Note } from "../../types/note";

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
          <Text style={styles.eyebrow}>Continuar nota</Text>
          <Text style={styles.meta}>Dia original: {sourceNote.day}</Text>

          <Text style={styles.label}>Titulo</Text>
          <TextInput
            placeholder="Titulo da nova nota"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="continue-note-title-input"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Dia da nota</Text>
          <TextInput
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="continue-note-day-input"
            value={newNoteDay}
            onChangeText={setNewNoteDay}
          />

          <Text style={styles.label}>Briefing</Text>
          <TextInput
            multiline
            placeholder="Resumo gerado"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.multiline]}
            testID="continue-note-brief-input"
            value={generatedBrief}
            onChangeText={setGeneratedBrief}
          />

          <Text style={styles.label}>Conteudo</Text>
          <TextInput
            multiline
            placeholder="Escreva a continuidade"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.multiline]}
            testID="continue-note-content-input"
            value={content}
            onChangeText={setContent}
          />

          {localErrorMessage || errorMessage ? (
            <Text style={styles.errorText}>{localErrorMessage ?? errorMessage}</Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.secondaryButton}
              testID="continue-note-cancel-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.primaryButton}
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
  meta: {
    marginTop: 10,
    fontSize: 13,
    color: "#4b5563",
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#b91c1c",
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
