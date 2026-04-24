import { useEffect, useRef } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Note } from "../../types/note";
import type { Task } from "../../types/task";
import type { DayTab, TimelineItemKind, TimelineNode } from "../../types/timeline";
import { NoteCardReal } from "../cards/note-card-real";
import { TaskCardGhost } from "../cards/task-card-ghost";
import { TaskCardReal } from "../cards/task-card-real";
import { TaskCardTimed } from "../cards/task-card-timed";
import { TaskCreationMarker } from "../cards/task-creation-marker";
import { TimelineItemWrapper } from "./timeline-item-wrapper";
import { TimelinePlusButton } from "./timeline-plus-button";

interface TimelineFeedbackCopy {
  instructionsTitle: string;
  instructionsBody: string;
  loadingTitle: string;
  loadingLabel: string;
  errorTitle: string;
  emptyTitle: string;
  emptyBody: string;
}

const feedbackCopyByTab: Record<DayTab, TimelineFeedbackCopy> = {
  timeline: {
    instructionsTitle: "Timeline do dia",
    instructionsBody:
      "Toque uma vez para abrir o Reader. Toque duas vezes para editar. O ghost card leva ao dia de destino.",
    loadingTitle: "Carregando o dia...",
    loadingLabel: "Carregando a timeline do dia.",
    errorTitle: "Falha ao carregar a timeline",
    emptyTitle: "Nada registrado neste dia ainda.",
    emptyBody:
      "Use o botao + para criar uma nota, uma tarefa deste dia ou uma tarefa projetada para outro dia.",
  },
  tasks: {
    instructionsTitle: "Tarefas do dia",
    instructionsBody:
      "Toque uma vez para abrir o Reader. Toque duas vezes para editar. Quando houver ghost card, ele leva ao dia de destino.",
    loadingTitle: "Carregando as tarefas...",
    loadingLabel: "Carregando as tarefas do dia.",
    errorTitle: "Falha ao carregar as tarefas",
    emptyTitle: "Nenhuma tarefa neste recorte ainda.",
    emptyBody:
      "Use o botao + para criar uma tarefa deste dia ou uma tarefa projetada para outro dia.",
  },
  notes: {
    instructionsTitle: "Notas do dia",
    instructionsBody:
      "Toque uma vez para abrir o Reader. Toque duas vezes para editar.",
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
  onCreateNote: () => void;
  onCreateTask: () => void;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
  onNavigateToTask: (task: Task) => void;
}

export function TimelineView({
  activeTab,
  nodes,
  isLoading,
  errorMessage,
  onCreateNote,
  onCreateTask,
  onOpenReader,
  onOpenEditor,
  onNavigateToTask,
}: TimelineViewProps) {
  const pendingPressRef = useRef<{
    id: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const copy = feedbackCopyByTab[activeTab];

  useEffect(() => {
    return () => {
      if (pendingPressRef.current) {
        clearTimeout(pendingPressRef.current.timeoutId);
      }
    };
  }, []);

  const handleNodePress = (node: TimelineNode) => {
    if (node.type === "task_ghost") {
      onNavigateToTask(node.data as Task);
      return;
    }

    if (pendingPressRef.current?.id === node.id) {
      clearTimeout(pendingPressRef.current.timeoutId);
      pendingPressRef.current = null;
      onOpenEditor(node.itemKind, node.itemId);
      return;
    }

    const timeoutId = setTimeout(() => {
      onOpenReader(node.itemKind, node.itemId);
      pendingPressRef.current = null;
    }, 220);

    pendingPressRef.current = {
      id: node.id,
      timeoutId,
    };
  };

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityLabel={`${copy.instructionsTitle}. ${copy.instructionsBody}`}
        style={styles.instructions}
      >
        <Text style={styles.instructionsTitle}>{copy.instructionsTitle}</Text>
        <Text style={styles.instructionsBody}>{copy.instructionsBody}</Text>
      </View>

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
          contentContainerStyle={styles.scrollContent}
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
          ) : (
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
                  {node.type === "note" ? (
                    <NoteCardReal note={node.data as Note} />
                  ) : null}
                  {node.type === "task_untimed" ? (
                    <TaskCardReal task={node.data as Task} />
                  ) : null}
                  {node.type === "task_creation_marker" ? (
                    <TaskCreationMarker task={node.data as Task} />
                  ) : null}
                  {node.type === "task_timed" ? (
                    <TaskCardTimed task={node.data as Task} />
                  ) : null}
                  {node.type === "task_ghost" ? (
                    <TaskCardGhost task={node.data as Task} />
                  ) : null}
                </TimelineItemWrapper>
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}

      <TimelinePlusButton
        onCreateNote={onCreateNote}
        onCreateTask={onCreateTask}
        isDisabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  instructions: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  instructionsBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
  },
  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
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
    borderRadius: 18,
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
    paddingBottom: 12,
  },
  timelineFrame: {
    position: "relative",
    gap: 10,
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
    borderRadius: 18,
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
