import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";

import { TaskEditor } from "../../../../src/components/forms/task-editor";
import { TaskReader } from "../../../../src/components/reader/task-reader";
import { useAuthSession } from "../../../../src/features/auth/hooks/use-auth-session";
import { useDayTimeline } from "../../../../src/features/day/hooks/use-day-timeline";
import { useNavigationStore } from "../../../../src/stores/navigation-store";

const single = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? "";

export default function TaskReaderRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string | string[]; id?: string | string[] }>();
  const date = single(params.date);
  const taskId = single(params.id);
  const { isAuthenticated, isBootstrapping, signInHref } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);

  const { taskLookup, reload } = useDayTimeline(date);
  const task = taskLookup.get(taskId) ?? null;

  const temporalNavigationContext = useNavigationStore(
    (state) => state.temporalNavigationContext,
  );
  const temporalContext = useMemo(
    () =>
      temporalNavigationContext &&
      task &&
      temporalNavigationContext.sourceTaskId === task.id
        ? temporalNavigationContext
        : null,
    [task, temporalNavigationContext],
  );

  if (!isBootstrapping && !isAuthenticated) {
    return <Redirect href={signInHref} />;
  }

  return (
    <>
      <TaskReader
        visible
        task={task}
        temporalContext={temporalContext}
        onClose={() => router.back()}
        onEdit={() => setIsEditing(true)}
      />

      <TaskEditor
        visible={isEditing}
        mode="edit"
        selectedDay={date}
        task={task}
        temporalContext={temporalContext}
        onClose={() => setIsEditing(false)}
        onSaved={async () => {
          await reload();
          setIsEditing(false);
        }}
      />
    </>
  );
}
