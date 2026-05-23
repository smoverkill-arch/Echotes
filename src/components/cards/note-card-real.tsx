import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontFamily,
  letterSpacing,
  lineHeight,
  radius,
  shadow,
  spacing,
  typography,
} from "../../theme/tokens";
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
          <Text style={styles.echoBadgeText}>
            {directEchoCount === 1 ? "1 eco" : `${directEchoCount} ecos`}
          </Text>
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.noteBorder,
    backgroundColor: colors.noteSoft,
    padding: spacing.lg,
    ...shadow.sm,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wider,
    color: colors.note,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    marginTop: spacing.sm,
    fontSize: typography.bodyLarge,
    lineHeight: typography.bodyLarge * lineHeight.snug,
    color: colors.text,
  },
  echoBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  echoBadgeText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: typography.caption,
    color: colors.note,
  },
  preview: {
    fontFamily: fontFamily.bodyRegular,
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: typography.body * lineHeight.normal,
    color: colors.textMuted,
  },
  footer: {
    fontFamily: fontFamily.bodyMedium,
    marginTop: spacing.sm,
    fontSize: typography.caption,
    color: colors.note,
  },
});
