import {
  noteEchoSchema,
  noteFormSchema,
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
});
