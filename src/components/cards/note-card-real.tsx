import { StyleSheet, Text, View } from "react-native";

import type { Note } from "../../types/note";

interface NoteCardRealProps {
  note: Note;
}

export function NoteCardReal({ note }: NoteCardRealProps) {
  return (
    <View style={styles.card} testID={`note-card-real-${note.id}`}>
      <Text style={styles.eyebrow}>Nota</Text>
      <Text style={styles.title}>{note.title}</Text>
      {note.content ? <Text style={styles.body}>{note.content}</Text> : null}
      {note.brief ? <Text style={styles.brief}>{note.brief}</Text> : null}
      <Text style={styles.footer}>Criada no dia em foco</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
    padding: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#1d4ed8",
  },
  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#1e293b",
  },
  brief: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: "#475569",
  },
  footer: {
    marginTop: 10,
    fontSize: 12,
    color: "#475569",
  },
});
