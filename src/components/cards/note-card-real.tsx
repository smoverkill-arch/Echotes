import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "../../theme/tokens";
import type { Note } from "../../types/note";

interface NoteCardRealProps {
  note: Note;
  directEchoCount?: number;
}

export function NoteCardReal({ note, directEchoCount = 0 }: NoteCardRealProps) {
  const previewText = note.content?.trim() || note.brief?.trim() || "";

  return (
    <View style={styles.card} testID={`note-card-real-${note.id}`}>
      <Text style={styles.eyebrow}>Nota</Text>
      <Text style={styles.title}>{note.title}</Text>
      {directEchoCount > 0 ? (
        <View style={styles.echoBadge} testID={`note-echo-badge-${note.id}`}>
          <Text style={styles.echoBadgeText}>Ecos {directEchoCount}</Text>
        </View>
      ) : null}
      {previewText ? (
        <Text numberOfLines={2} style={styles.preview}>
          {previewText}
        </Text>
      ) : null}
      <Text style={styles.footer}>Criada no dia em foco</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.noteSoft,
    backgroundColor: colors.noteSoft,
    padding: spacing.lg,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
    color: colors.note,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.bodyLarge,
    fontWeight: "800",
    color: colors.text,
  },
  echoBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  echoBadgeText: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.note,
  },
  preview: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.textMuted,
  },
  footer: {
    marginTop: spacing.sm,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
});
