import {
  continueNoteInputSchema,
  noteEchoCandidatePageSchema,
  noteEchoSchema,
  noteFormSchema,
  relatedNoteSchema,
} from "../../../src/schemas/note.schema";

describe("note schema validation", () => {
  // @req NFR-003
  it("aceita nota valida com contrato local de formulario", () => {
    const parsed = noteFormSchema.safeParse({
      title: "Nota do dia",
      content: "Registrar contexto",
      brief: "Resumo curto",
      day: "2026-04-18",
      tag_id: null,
      color: null,
      is_color_overridden: false,
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data).toMatchObject({
      title: "Nota do dia",
      day: "2026-04-18",
      brief: "Resumo curto",
    });
  });

  // @req NFR-003
  it("rejeita eco que aponta para a mesma nota", () => {
    const parsed = noteEchoSchema.safeParse({
      from_note_id: "10000000-0000-4000-8000-000000000001",
      to_note_id: "10000000-0000-4000-8000-000000000001",
      kind: "manual_link",
      context_note_id: null,
      context_day: "2026-04-18",
      metadata: null,
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe(
      "Uma nota nao pode criar eco com ela mesma.",
    );
  });

  it("valida candidata ja conectada, item indisponivel e input de continuacao", () => {
    expect(
      noteEchoCandidatePageSchema.safeParse({
        items: [
          {
            id: "20000000-0000-4000-8000-000000000001",
            day: "2026-05-01",
            title: "Candidata",
            brief: null,
            created_at: "2026-05-01T09:00:00+00:00",
            isAlreadyConnected: true,
          },
        ],
        nextCursor: {
          isSelectedDayGroup: true,
          day: "2026-05-01",
          created_at: "2026-05-01T09:00:00+00:00",
          id: "20000000-0000-4000-8000-000000000001",
        },
      }).success,
    ).toBe(true);

    expect(
      relatedNoteSchema.safeParse({
        id: "10000000-0000-4000-8000-000000000002",
        day: null,
        title: null,
        brief: null,
        created_at: null,
        kind: "manual_link",
        echoId: "30000000-0000-4000-8000-000000000001",
        availability: "transient_unavailable",
      }).success,
    ).toBe(true);

    expect(
      continueNoteInputSchema.safeParse({
        sourceNoteId: "10000000-0000-4000-8000-000000000001",
        newNoteDay: "2026-05-02",
        title: "Continuacao",
        generatedBrief: "Briefing",
        content: "",
      }).success,
    ).toBe(true);
  });
});
