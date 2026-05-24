import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Task } from "../../types/task";
import type { Note } from "../../types/note";
import type { TimelineItemKind, TimelineNode } from "../../types/timeline";
import { colors, radius, spacing, typography } from "../../theme/tokens";
import { NoteCardReal } from "../cards/note-card-real";
import { TaskCardGhost } from "../cards/task-card-ghost";
import { TaskCardReal } from "../cards/task-card-real";
import { TaskCardTimed } from "../cards/task-card-timed";
import { TaskCreationMarker } from "../cards/task-creation-marker";
import type { TimelineAxisPosition } from "./timeline-page-item";
import { TimelinePageItem } from "./timeline-page-item";

interface TimelinePageFeedback {
  loadingTitle: string;
  loadingLabel: string;
  errorTitle: string;
  emptyTitle: string;
  emptyBody: string;
}

export const taskPageFeedback: TimelinePageFeedback = {
  loadingTitle: "Carregando tarefas...",
  loadingLabel: "Carregando a timeline de tarefas do dia.",
  errorTitle: "Falha ao carregar as tarefas",
  emptyTitle: "Nenhuma tarefa neste dia ainda.",
  emptyBody: "Use o botao + para criar uma tarefa deste dia ou projetada para outro dia.",
};

export const notePageFeedback: TimelinePageFeedback = {
  loadingTitle: "Carregando notas...",
  loadingLabel: "Carregando a timeline de notas do dia.",
  errorTitle: "Falha ao carregar as notas",
  emptyTitle: "Nenhuma nota neste dia ainda.",
  emptyBody: "Use o botao + para criar uma nota deste dia.",
};

interface TimelinePageViewProps {
  axisPosition: TimelineAxisPosition;
  nodes: TimelineNode[];
  isLoading: boolean;
  errorMessage: string | null;
  feedback: TimelinePageFeedback;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
  onNavigateToTask: (task: Task) => void;
  onScrollInteractionStart?: () => void;
  onScrollInteractionEnd?: () => void;
  contentTopInset?: number;
  testID?: string;
}

export function TimelinePageView({
  axisPosition,
  nodes,
  isLoading,
  errorMessage,
  feedback,
  onOpenReader,
  onOpenEditor,
  onNavigateToTask,
  onScrollInteractionStart,
  onScrollInteractionEnd,
  contentTopInset = 0,
  testID,
}: TimelinePageViewProps) {
  const pendingPressRef = useRef<{
    id: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    return () => {
      clearPendingPress();
    };
  }, []);

  const clearPendingPress = () => {
    if (!pendingPressRef.current) return;
    clearTimeout(pendingPressRef.current.timeoutId);
    pendingPressRef.current = null;
  };

  const handleNodePress = (node: TimelineNode) => {
    if (node.type === "task_ghost") {
      clearPendingPress();
      onNavigateToTask(node.data as Task);
      return;
    }

    if (pendingPressRef.current?.id === node.id) {
      clearPendingPress();
      onOpenEditor(node.itemKind, node.itemId);
      return;
    }

    clearPendingPress();

    const timeoutId = setTimeout(() => {
      if (pendingPressRef.current?.id !== node.id) return;
      onOpenReader(node.itemKind, node.itemId);
      pendingPressRef.current = null;
    }, 220);

    pendingPressRef.current = { id: node.id, timeoutId };
  };

  const renderCard = (node: TimelineNode) => {
    if (node.type === "note") return <NoteCardReal note={node.data as Note} directEchoCount={node.directEchoCount} />;
    if (node.type === "task_untimed") return <TaskCardReal task={node.data as Task} />;
    if (node.type === "task_creation_marker") return <TaskCreationMarker task={node.data as Task} />;
    if (node.type === "task_timed") return <TaskCardTimed task={node.data as Task} />;
    if (node.type === "task_ghost") return <TaskCardGhost task={node.data as Task} />;
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.feedbackContainer}>
        <View
          accessible
          accessibilityLabel={feedback.loadingLabel}
          accessibilityLiveRegion="polite"
          accessibilityState={{ busy: true }}
          style={styles.feedbackCard}
        >
          <ActivityIndicator color={colors.textMuted} size="small" />
          <Text style={styles.feedbackTitle}>{feedback.loadingTitle}</Text>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.feedbackContainer}>
        <View
          accessible
          accessibilityLabel={`${feedback.errorTitle}. ${errorMessage}`}
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
          style={[styles.feedbackCard, styles.errorCard]}
        >
          <Text style={[styles.feedbackTitle, styles.errorTitle]}>{feedback.errorTitle}</Text>
          <Text style={styles.errorBody}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        contentTopInset > 0 ? { paddingTop: contentTopInset } : null,
      ]}
      onMomentumScrollBegin={onScrollInteractionStart}
      onMomentumScrollEnd={onScrollInteractionEnd}
      onScrollBeginDrag={onScrollInteractionStart}
      onScrollEndDrag={onScrollInteractionEnd}
      scrollEventThrottle={16}
      style={styles.scrollView}
      testID={testID ?? "timeline-page-view"}
    >
      {nodes.length === 0 ? (
        <View
          accessible
          accessibilityLabel={`${feedback.emptyTitle}. ${feedback.emptyBody}`}
          style={styles.emptyState}
        >
          <Text style={styles.emptyTitle}>{feedback.emptyTitle}</Text>
          <Text style={styles.emptyBody}>{feedback.emptyBody}</Text>
        </View>
      ) : (
        <View style={styles.timelineFrame}>
          <View
            style={[
              styles.axisRail,
              axisPosition === "left" ? styles.axisRailLeft : styles.axisRailRight,
            ]}
            testID="timeline-axis-rail"
          />
          {nodes.map((node) => (
            <TimelinePageItem
              key={node.id}
              node={node}
              axisPosition={axisPosition}
              onPress={() => handleNodePress(node)}
            >
              {renderCard(node)}
            </TimelinePageItem>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: spacing.xs,
  },
  timelineFrame: {
    position: "relative",
    gap: spacing.sm,
  },
  axisRail: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border,
  },
  axisRailLeft: {
    left: 20,
  },
  axisRailRight: {
    right: 20,
  },
  feedbackContainer: {
    flex: 1,
    padding: spacing.md,
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  feedbackTitle: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.text,
  },
  errorCard: {
    flexDirection: "column",
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
  },
  errorTitle: {
    color: colors.danger,
    fontWeight: "700",
  },
  errorBody: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.danger,
  },
  emptyState: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.bodyLarge,
    fontWeight: "700",
    color: colors.text,
  },
  emptyBody: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
