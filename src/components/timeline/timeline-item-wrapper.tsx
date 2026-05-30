import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import type { TimelineNode } from "../../types/timeline";

type TimelineSide = "left" | "right";

const resolveTimelineSide = (node: TimelineNode): TimelineSide =>
  node.type === "note" ? "right" : "left";

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
        <View style={styles.axisDot} testID={`timeline-axis-dot-${node.id}`} />
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
    paddingRight: 16,
  },
  rightColumn: {
    paddingLeft: 16,
  },
  axisColumn: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  axisDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#94a3b8",
    backgroundColor: "#ffffff",
  },
  nodeButton: {
    width: "92%",
    borderRadius: 18,
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
