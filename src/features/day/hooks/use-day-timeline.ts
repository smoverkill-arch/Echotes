import { useMemo } from "react";

import { deriveTimelineNodes } from "../../timeline/utils/derive-timeline-nodes";
import { countDirectEchoes } from "../../notes/utils/note-echo-relations";
import type { DayTab } from "../../../types/timeline";
import { useDayEntries } from "./use-day-entries";

export const useDayTimeline = (
  selectedDay: string,
  activeTab: DayTab = "timeline",
) => {
  const dayEntries = useDayEntries(selectedDay);
  const taskLookup = useMemo(
    () =>
      new Map(dayEntries.tasks.map((task) => [task.id, task])),
    [dayEntries.tasks],
  );

  const timelineNodes = useMemo(() => {
    const directEchoCounts = countDirectEchoes(
      dayEntries.echoes,
      dayEntries.notes.map((note) => note.id),
    );
    const nodes = deriveTimelineNodes({
      selectedDay,
      // O recorte da fase atual fica na leitura; a derivacao da timeline deve
      // receber o conjunto carregado sem reaplicar filtros silenciosos.
      tasks: dayEntries.tasks,
      notes: dayEntries.notes,
      directEchoCounts,
    });

    if (activeTab === "tasks") {
      return nodes.filter(
        (node) => node.itemKind === "task" && node.type !== "task_creation_marker",
      );
    }

    if (activeTab === "notes") {
      return nodes.filter((node) => node.itemKind === "note");
    }

    return nodes;
  }, [activeTab, dayEntries.echoes, dayEntries.notes, dayEntries.tasks, selectedDay]);

  return {
    ...dayEntries,
    taskLookup,
    timelineNodes,
  };
};
