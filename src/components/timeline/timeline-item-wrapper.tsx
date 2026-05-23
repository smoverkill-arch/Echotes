import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "../../theme/tokens";
import type { TimelineNode } from "../../types/timeline";

type TimelineSide = "left" | "right";

const resolveTimelineSide = (node: TimelineNode): TimelineSide =>
  node.type === "note" ? "right" : "left";

/** Resolve a cor do dot do eixo com base no tipo do nó da timeline. */
const resolveAxisDotBorderColor = (node: TimelineNode): string => {
  if (node.type === "note") return colors.note;
  if (node.type === "task_timed") return colors.taskTimed;
  if (node.type === "task_ghost") return colors.taskGhost;
  return colors.task;
};

interface TimelineItemWrapperProps {
  node: TimelineNode;
  onPress: () => void;
  children: ReactNode;
}

export function TimelineItemWrapper({
  node,
  onPress,
  children,
}: TimelineItemWrapperProps) {
  const side = resolveTimelineSide(node);
  const dotBorderColor = resolveAxisDotBorderColor(node);

  return (
    <View style={styles.row} testID={`timeline-item-wrapper-${side}-${node.id}`}>
      <View style={[styles.sideColumn, styles.leftColumn]}>
        {side === "left" ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.nodeButton,
              styles.nodeButtonLeft,
              pressed ? styles.nodeButtonPressed : null,
            ]}
            testID={`timeline-node-${node.id}`}
            onPress={onPress}
          >
            {children}
          </Pressable>
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>

      <View style={styles.axisColumn}>
        <View
          style={[styles.axisDot, { borderColor: dotBorderColor }]}
          testID={`timeline-axis-dot-${node.id}`}
        />
      </View>

      <View style={[styles.sideColumn, styles.rightColumn]}>
        {side === "right" ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.nodeButton,
              styles.nodeButtonRight,
              pressed ? styles.nodeButtonPressed : null,
            ]}
            testID={`timeline-node-${node.id}`}
            onPress={onPress}
          >
            {children}
          </Pressable>
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 76,
  },
  sideColumn: {
    flex: 1,
    justifyContent: "center",
  },
  leftColumn: {
    paddingRight: spacing.lg,
  },
  rightColumn: {
    paddingLeft: spacing.lg,
  },
  axisColumn: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  axisDot: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    borderWidth: 2,
    // borderColor é injetado dinamicamente via resolveAxisDotBorderColor
    backgroundColor: colors.surface,
  },
  nodeButton: {
    width: "92%",
    borderRadius: radius.xl,
  },
  nodeButtonLeft: {
    alignSelf: "flex-end",
  },
  nodeButtonRight: {
    alignSelf: "flex-start",
  },
  nodeButtonPressed: {
    opacity: 0.94,
  },
  sideSpacer: {
    minHeight: 1,
  },
});
