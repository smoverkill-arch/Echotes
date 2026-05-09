import { StyleSheet, Text, View } from "react-native";

import type { Note } from "../../types/note";

interface NoteCardRealProps {
  note: Note;
  directEchoCount?: number;
}

export function NoteCardReal({ note, directEchoCount = 0 }: NoteCardRealProps) {
  return (
    <View style={styles.card} testID={`note-card-real-${note.id}`}>
      <Text style={styles.eyebrow}>Nota</Text>
      <Text style={styles.title}>{note.title}</Text>
      {directEchoCount > 0 ? (
        <View style={styles.echoBadge} testID={`note-echo-badge-${note.id}`}>
          <Text style={styles.echoBadgeText}>Ecos {directEchoCount}</Text>
        </View>
      ) : null}
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
  echoBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  echoBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
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
