import { StyleSheet, Text, View } from "react-native";

import {
  densityMetrics,
  useAppearancePalette,
  useAppearanceStore,
} from "../../stores/appearance-store";
import { radius, spacing, typography } from "../../theme/tokens";
import type { Note } from "../../types/note";

interface NoteCardRealProps {
  note: Note;
  directEchoCount?: number;
}

export function NoteCardReal({ note, directEchoCount = 0 }: NoteCardRealProps) {
  const palette = useAppearancePalette();
  const density = useAppearanceStore((state) => state.density);
  const metrics = densityMetrics[density];
  const previewText = note.content?.trim() || note.brief?.trim() || "";

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: palette.border,
          borderLeftColor: palette.note,
          backgroundColor: palette.surface,
          paddingVertical: metrics.cardPaddingVertical,
          paddingHorizontal: metrics.cardPaddingHorizontal,
          shadowColor: palette.shadowColor,
        },
      ]}
      testID={`note-card-real-${note.id}`}
    >
      <View style={styles.metaRow}>
        <Text style={[styles.eyebrow, { color: palette.note }]}>Nota</Text>
        {directEchoCount > 0 ? (
          <View
            style={[styles.echoBadge, { backgroundColor: palette.noteSoft }]}
            testID={`note-echo-badge-${note.id}`}
          >
            <Text style={[styles.echoBadgeText, { color: palette.note }]}>
              Ecos {directEchoCount}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.title, { color: palette.text, fontSize: metrics.noteTitleSize }]}>
        {note.title}
      </Text>
      {previewText && metrics.showPreview ? (
        <Text
          numberOfLines={2}
          style={[
            styles.preview,
            { color: palette.textMuted, lineHeight: metrics.previewLineHeight },
          ]}
        >
          {previewText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderLeftWidth: 3,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing.xs,
    fontWeight: "800",
  },
  echoBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  echoBadgeText: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  preview: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
});
