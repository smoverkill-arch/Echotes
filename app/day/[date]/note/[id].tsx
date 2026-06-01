import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { ContinueNoteEditor } from "../../../../src/components/forms/continue-note-editor";
import { NoteEditor } from "../../../../src/components/forms/note-editor";
import { NoteEchoPicker } from "../../../../src/components/reader/note-echo-picker";
import { NoteReader } from "../../../../src/components/reader/note-reader";
import { useAuthSession } from "../../../../src/features/auth/hooks/use-auth-session";
import { useNoteReaderController } from "../../../../src/features/day/hooks/use-note-reader-controller";

const single = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? "";

export default function NoteReaderRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string | string[]; id?: string | string[] }>();
  const date = single(params.date);
  const noteId = single(params.id);
  const { isAuthenticated, isBootstrapping, signInHref } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);

  const controller = useNoteReaderController(date, noteId);

  const reload = controller.reload;
  useEffect(() => {
    void reload();
  }, [reload]);

  if (!isBootstrapping && !isAuthenticated) {
    return <Redirect href={signInHref} />;
  }

  return (
    <>
      <NoteReader
        visible
        note={controller.note}
        relatedNotes={controller.relatedNotes}
        echoFeedbackMessage={controller.echoFeedback}
        onClose={() => router.back()}
        onEdit={() => setIsEditing(true)}
        onOpenRelatedNote={controller.openRelatedNote}
        onReloadRelatedNote={controller.loadRelatedNotes}
        onAddEcho={controller.openEchoPicker}
        onRemoveEcho={controller.handleRemoveEcho}
        onContinueNote={controller.openContinue}
      />

      <NoteEchoPicker
        visible={controller.isEchoPickerVisible}
        sourceNote={controller.note}
        selectedDay={date}
        existingEchoes={controller.noteEchoes}
        onClose={controller.closeEchoPicker}
        onSelectCandidate={controller.handleSelectCandidate}
      />

      <ContinueNoteEditor
        visible={controller.isContinueVisible}
        selectedDay={date}
        sourceNote={controller.note}
        isSubmitting={controller.isContinuing}
        errorMessage={controller.continueError}
        onClose={controller.closeContinue}
        onSubmit={controller.handleContinueNote}
      />

      <NoteEditor
        visible={isEditing}
        mode="edit"
        selectedDay={date}
        note={controller.note}
        onClose={() => setIsEditing(false)}
        onSaved={async () => {
          await controller.reload();
          setIsEditing(false);
        }}
      />
    </>
  );
}
