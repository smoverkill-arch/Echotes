import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { NoteReader } from "../../../src/components/reader/note-reader";
import { deleteNoteEcho } from "../../../src/features/notes/api/delete-note-echo";
import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import type { RelatedNote } from "../../../src/types/note";
import {
  buildConnectedPair,
  NOTE_ECHO_FIXTURE_USER_ID,
} from "../../support/note-echo-fixtures";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockSupabase = createSupabaseNoteEchoMock();

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => mockSupabase.client,
  getSupabaseConfigurationError: () => null,
  isSupabaseConfigured: true,
}));

const authenticatedSession: AuthenticatedSession = {
  userId: NOTE_ECHO_FIXTURE_USER_ID,
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

// @req 002-note-echo-flows:FR-009
// @req 002-note-echo-flows:SC-003
describe("deleteNoteEcho", () => {
  beforeEach(() => {
    mockSupabase.reset();
    useAuthStore.setState({
      status: "authenticated",
      session: authenticatedSession,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: true,
    });
  });

  it("exige confirmacao no Reader antes de chamar remocao", () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    const relatedNote: RelatedNote = {
      id: targetNote.id,
      day: targetNote.day,
      title: targetNote.title,
      brief: targetNote.brief,
      created_at: targetNote.created_at,
      kind: echo.kind,
      echoId: echo.id,
      availability: "available",
    };
    const onRemoveEcho = jest.fn();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation();

    render(
      React.createElement(NoteReader, {
        visible: true,
        note: sourceNote,
        relatedNotes: [relatedNote],
        onClose: jest.fn(),
        onEdit: jest.fn(),
        onRemoveEcho,
      }),
    );

    fireEvent.press(screen.getByTestId(`note-reader-remove-echo-${echo.id}`));

    expect(onRemoveEcho).not.toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0][2] ?? [];
    const confirmButton = buttons.find((button) => button.text === "Remover eco");
    confirmButton?.onPress?.();

    expect(onRemoveEcho).toHaveBeenCalledWith(relatedNote);
  });

  it("remove apenas a relacao selecionada e preserva as duas notas", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.setTableRows("notes", [sourceNote, targetNote]);
    mockSupabase.setTableRows("note_echoes", [echo]);

    const result = await deleteNoteEcho({
      echoId: echo.id,
      noteIdA: sourceNote.id,
      noteIdB: targetNote.id,
    });

    expect(result).toEqual({
      ok: true,
      status: "deleted",
      errorMessage: null,
    });
    expect(mockSupabase.getTableRows("notes")).toHaveLength(2);
    expect(mockSupabase.getTableRows("note_echoes")).toHaveLength(0);
  });
});
