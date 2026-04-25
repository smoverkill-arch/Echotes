import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createNote } from "../../features/notes/api/create-note";
import { updateNote } from "../../features/notes/api/update-note";
import type { Note } from "../../types/note";

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
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>
            {mode === "create" ? "Criar nota" : "Editar nota"}
          </Text>
          <Text style={styles.meta}>Dia: {selectedDay}</Text>

          <Text style={styles.label}>Titulo</Text>
          <TextInput
            placeholder="Titulo da nota"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="note-editor-title-input"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Conteudo</Text>
          <TextInput
            multiline
            placeholder="Escreva sua nota"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.multiline]}
            testID="note-editor-content-input"
            value={content}
            onChangeText={setContent}
          />

          <Text style={styles.label}>Briefing</Text>
          <TextInput
            multiline
            placeholder="Resumo opcional"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.multiline]}
            testID="note-editor-brief-input"
            value={brief}
            onChangeText={setBrief}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.secondaryButton}
              testID="note-editor-cancel-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.primaryButton}
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
    minHeight: 110,
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
