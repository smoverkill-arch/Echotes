import { useMemo } from "react";

import { deriveTimelineNodes } from "../../timeline/utils/derive-timeline-nodes";
import { countDirectEchoes } from "../../notes/utils/note-echo-relations";
import { useDayEntries } from "./use-day-entries";

export const useDayTimeline = (selectedDay: string) => {
  const dayEntries = useDayEntries(selectedDay);

  const taskLookup = useMemo(
    () => new Map(dayEntries.tasks.map((task) => [task.id, task])),
    [dayEntries.tasks],
  );

  const allNodes = useMemo(() => {
    const directEchoCounts = countDirectEchoes(
      dayEntries.echoes,
      dayEntries.notes.map((note) => note.id),
    );
    return deriveTimelineNodes({
      selectedDay,
      tasks: dayEntries.tasks,
      notes: dayEntries.notes,
      directEchoCounts,
    });
  }, [dayEntries.echoes, dayEntries.notes, dayEntries.tasks, selectedDay]);

  const taskNodes = useMemo(
    () => allNodes.filter((node) => node.itemKind === "task"),
    [allNodes],
  );

  const noteNodes = useMemo(
    () => allNodes.filter((node) => node.itemKind === "note"),
    [allNodes],
  );

  return {
    ...dayEntries,
    taskLookup,
    taskNodes,
    noteNodes,
  };
};
