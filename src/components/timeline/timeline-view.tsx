import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Note } from "../../types/note";
import type { Task } from "../../types/task";
import type { TimelineItemKind, TimelineNode } from "../../types/timeline";
import { NoteCardReal } from "../cards/note-card-real";
import { TaskCardReal } from "../cards/task-card-real";
import { TaskCardTimed } from "../cards/task-card-timed";
import { TaskCreationMarker } from "../cards/task-creation-marker";
import { TimelinePlusButton } from "./timeline-plus-button";

interface TimelineViewProps {
  nodes: TimelineNode[];
  isLoading: boolean;
  errorMessage: string | null;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
}

export function TimelineView({
  nodes,
  isLoading,
  errorMessage,
  onCreateNote,
  onCreateTask,
  onOpenReader,
  onOpenEditor,
}: TimelineViewProps) {
  const pendingPressRef = useRef<{
    id: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (pendingPressRef.current) {
        clearTimeout(pendingPressRef.current.timeoutId);
      }
    };
  }, []);

  const handleNodePress = (node: TimelineNode) => {
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
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Timeline do dia</Text>
        <Text style={styles.instructionsBody}>
          Toque uma vez para abrir o Reader. Toque duas vezes para editar.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Carregando o dia...</Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Falha ao carregar a timeline</Text>
          <Text style={styles.feedbackBody}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          testID="timeline-view"
        >
          {nodes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nada registrado neste dia ainda.</Text>
              <Text style={styles.emptyBody}>
                Use o botao + para criar uma nota ou tarefa do mesmo dia.
              </Text>
            </View>
          ) : (
            nodes.map((node) => (
              <Pressable
                key={node.id}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.nodeButton,
                  pressed ? styles.nodeButtonPressed : null,
                ]}
                testID={`timeline-node-${node.id}`}
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
              </Pressable>
            ))
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
  nodeButton: {
    borderRadius: 18,
  },
  nodeButtonPressed: {
    opacity: 0.94,
  },
});
