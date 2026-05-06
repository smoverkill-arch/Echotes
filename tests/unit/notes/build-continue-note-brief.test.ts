import { buildContinueNoteBrief } from "../../../src/features/notes/utils/build-continue-note-brief";
import { buildNote } from "../../support/note-echo-fixtures";

describe("buildContinueNoteBrief", () => {
  it("prioriza brief util antes de content e title", () => {
    const note = buildNote({
      id: "10000000-0000-4000-8000-000000000001",
      title: "Titulo",
      content: "Conteudo",
      brief: "  Briefing\ncom contexto  ",
    });

    expect(buildContinueNoteBrief(note)).toBe("Briefing com contexto");
  });

  it("usa content normalizado quando brief esta vazio", () => {
    const note = buildNote({
      id: "10000000-0000-4000-8000-000000000001",
      title: "Titulo",
      content: "Primeira linha\n\nsegunda linha",
      brief: "   ",
    });

    expect(buildContinueNoteBrief(note)).toBe("Primeira linha segunda linha");
  });

  it("usa fallback canonico e limita sem cortar palavra quando possivel", () => {
    const note = buildNote({
      id: "10000000-0000-4000-8000-000000000001",
      title: `${"palavra ".repeat(40)}fim`,
      content: "",
      brief: null,
    });

    const brief = buildContinueNoteBrief(note);

    expect(brief.startsWith("Continuidade de palavra")).toBe(true);
    expect(brief.length).toBeLessThanOrEqual(180);
    expect(brief.endsWith(" ")).toBe(false);
  });
});
