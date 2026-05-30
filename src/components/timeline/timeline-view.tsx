import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Note } from "../../types/note";
import type { Task } from "../../types/task";
import type { DayTab, TimelineItemKind, TimelineNode } from "../../types/timeline";
import { NoteCardReal } from "../cards/note-card-real";
import { TaskCardGhost } from "../cards/task-card-ghost";
import { TaskCardReal } from "../cards/task-card-real";
import { TaskCardTimed } from "../cards/task-card-timed";
import { TaskCreationMarker } from "../cards/task-creation-marker";
import { TimelineItemWrapper } from "./timeline-item-wrapper";

interface TimelineFeedbackCopy {
  loadingTitle: string;
  loadingLabel: string;
  errorTitle: string;
  emptyTitle: string;
  emptyBody: string;
}

const feedbackCopyByTab: Record<DayTab, TimelineFeedbackCopy> = {
  timeline: {
    loadingTitle: "Carregando o dia...",
    loadingLabel: "Carregando a timeline do dia.",
    errorTitle: "Falha ao carregar a timeline",
    emptyTitle: "Nada registrado neste dia ainda.",
    emptyBody:
      "Use o botao + para criar uma nota, uma tarefa deste dia ou uma tarefa projetada para outro dia.",
  },
  tasks: {
    loadingTitle: "Carregando as tarefas...",
    loadingLabel: "Carregando as tarefas do dia.",
    errorTitle: "Falha ao carregar as tarefas",
    emptyTitle: "Nenhuma tarefa neste recorte ainda.",
    emptyBody:
      "Use o botao + para criar uma tarefa deste dia ou uma tarefa projetada para outro dia.",
  },
  notes: {
    loadingTitle: "Carregando as notas...",
    loadingLabel: "Carregando as notas do dia.",
    errorTitle: "Falha ao carregar as notas",
    emptyTitle: "Nenhuma nota neste recorte ainda.",
    emptyBody: "Use o botao + para criar uma nota deste dia.",
  },
};

interface TimelineViewProps {
  activeTab: DayTab;
  nodes: TimelineNode[];
  isLoading: boolean;
  errorMessage: string | null;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
  onNavigateToTask: (task: Task) => void;
  onScrollInteractionStart?: () => void;
  onScrollInteractionEnd?: () => void;
  contentTopInset?: number;
}

export function TimelineView({
  activeTab,
  nodes,
  isLoading,
  errorMessage,
  onOpenReader,
  onOpenEditor,
  onNavigateToTask,
  onScrollInteractionStart,
  onScrollInteractionEnd,
  contentTopInset = 0,
}: TimelineViewProps) {
  const pendingPressRef = useRef<{
    id: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const copy = feedbackCopyByTab[activeTab];
  const isTimelineTab = activeTab === "timeline";

  useEffect(() => {
    return () => {
      clearPendingPress();
    };
  }, []);

  const clearPendingPress = () => {
    if (!pendingPressRef.current) {
      return;
    }

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
      if (pendingPressRef.current?.id !== node.id) {
        return;
      }

      onOpenReader(node.itemKind, node.itemId);
      pendingPressRef.current = null;
    }, 220);

    pendingPressRef.current = {
      id: node.id,
      timeoutId,
    };
  };

  const renderNodeCard = (node: TimelineNode) => {
    if (node.type === "note") {
      return (
        <NoteCardReal
          note={node.data as Note}
          directEchoCount={node.directEchoCount}
        />
      );
    }

    if (node.type === "task_untimed") {
      return <TaskCardReal task={node.data as Task} />;
    }

    if (node.type === "task_creation_marker") {
      return <TaskCreationMarker task={node.data as Task} />;
    }

    if (node.type === "task_timed") {
      return <TaskCardTimed task={node.data as Task} />;
    }

    if (node.type === "task_ghost") {
      return <TaskCardGhost task={node.data as Task} />;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        {isLoading ? (
          <View
            accessible
            accessibilityLabel={copy.loadingLabel}
            accessibilityLiveRegion="polite"
            accessibilityState={{ busy: true }}
            style={styles.loadingCard}
            testID="timeline-loading-state"
          >
            <ActivityIndicator color="#475569" size="small" />
            <Text style={styles.loadingTitle}>{copy.loadingTitle}</Text>
          </View>
        ) : null}

        {!isLoading && errorMessage ? (
          <View
            accessible
            accessibilityLabel={`${copy.errorTitle}. ${errorMessage}`}
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            style={styles.feedbackCard}
            testID="timeline-error-state"
          >
            <Text style={styles.feedbackTitle}>{copy.errorTitle}</Text>
            <Text style={styles.feedbackBody}>{errorMessage}</Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage ? (
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
            testID="timeline-view"
          >
            {nodes.length === 0 ? (
              <View
                accessible
                accessibilityLabel={`${copy.emptyTitle}. ${copy.emptyBody}`}
                style={styles.emptyState}
                testID="timeline-empty-state"
              >
                <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
                <Text style={styles.emptyBody}>{copy.emptyBody}</Text>
              </View>
            ) : isTimelineTab ? (
              <View style={styles.timelineFrame}>
                <View style={styles.axisRail} testID="timeline-axis-rail" />
                {nodes.map((node) => (
                  <TimelineItemWrapper
                    key={node.id}
                    node={node}
                    onPress={() => {
                      handleNodePress(node);
                    }}
                  >
                    {renderNodeCard(node)}
                  </TimelineItemWrapper>
                ))}
              </View>
            ) : (
              <View
                style={styles.linearList}
                testID={activeTab === "tasks" ? "tasks-list-view" : "notes-list-view"}
              >
                {nodes.map((node) => (
                  <Pressable
                    key={node.id}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.listCardButton,
                      pressed ? styles.listCardButtonPressed : null,
                    ]}
                    testID={`timeline-linear-node-${node.id}`}
                    onPress={() => {
                      handleNodePress(node);
                    }}
                  >
                    {renderNodeCard(node)}
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        ) : null}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    position: "relative",
  },
  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  feedbackCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    padding: 16,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#991b1b",
  },
  feedbackBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#7f1d1d",
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 96,
  },
  scrollView: {
    flex: 1,
  },
  timelineFrame: {
    position: "relative",
    gap: 10,
  },
  linearList: {
    gap: 12,
  },
  listCardButton: {
    width: "100%",
  },
  listCardButtonPressed: {
    opacity: 0.94,
  },
  axisRail: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    marginLeft: -1,
    width: 2,
    backgroundColor: "#cbd5e1",
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
  },
});
