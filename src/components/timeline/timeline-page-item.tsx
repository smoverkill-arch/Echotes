import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { TimelineNode } from "../../types/timeline";
import { colors, spacing } from "../../theme/tokens";

export type TimelineAxisPosition = "left" | "right";

interface TimelinePageItemProps {
  node: TimelineNode;
  axisPosition: TimelineAxisPosition;
  onPress: () => void;
  children: ReactNode;
}

export function TimelinePageItem({
  node,
  axisPosition,
  onPress,
  children,
}: TimelinePageItemProps) {
  const axis = (
    <View style={styles.axisColumn}>
      <View style={styles.axisDot} testID={`timeline-axis-dot-${node.id}`} />
    </View>
  );

  const card = (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.cardButton, pressed && styles.cardButtonPressed]}
      testID={`timeline-node-${node.id}`}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );

  return (
    <View
      style={styles.row}
      testID={`timeline-page-item-${axisPosition}-${node.id}`}
    >
      {axisPosition === "left" ? (
        <>
          {axis}
          {card}
        </>
      ) : (
        <>
          {card}
          {axis}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 72,
  },
  axisColumn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  axisDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  cardButton: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.xs,
  },
  cardButtonPressed: {
    opacity: 0.94,
  },
});
