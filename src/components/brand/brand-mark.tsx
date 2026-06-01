import { StyleSheet, Text, View } from "react-native";

import { useAppearancePalette } from "../../stores/appearance-store";
import { fontFamily } from "../../theme/fonts";
import { radius } from "../../theme/tokens";

type BrandMarkSize = "sm" | "md" | "lg";

interface BrandMarkProps {
  size?: BrandMarkSize;
  showWordmark?: boolean;
}

const sizeMetrics: Record<
  BrandMarkSize,
  { box: number; glyph: number; wordmark: number; gap: number; radius: number }
> = {
  sm: { box: 28, glyph: 16, wordmark: 18, gap: 8, radius: radius.md },
  md: { box: 44, glyph: 24, wordmark: 26, gap: 12, radius: radius.lg },
  lg: { box: 64, glyph: 34, wordmark: 38, gap: 14, radius: radius.lg },
};

export function BrandMark({ size = "md", showWordmark = true }: BrandMarkProps) {
  const palette = useAppearancePalette();
  const metrics = sizeMetrics[size];

  return (
    <View style={[styles.row, { gap: metrics.gap }]} testID={`brand-mark-${size}`}>
      <View
        style={[
          styles.badge,
          {
            width: metrics.box,
            height: metrics.box,
            borderRadius: metrics.radius,
            backgroundColor: palette.primary,
          },
        ]}
      >
        <Text style={[styles.glyph, { fontSize: metrics.glyph, color: palette.primaryText }]}>
          E
        </Text>
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, { fontSize: metrics.wordmark, color: palette.text }]}>
          Echotes
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    fontFamily: fontFamily.display,
    lineHeight: undefined,
  },
  wordmark: {
    fontFamily: fontFamily.display,
  },
});
