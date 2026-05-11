import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const readJson = <T>(relativePath: string) =>
  JSON.parse(readFileSync(resolve(root, relativePath), "utf8")) as T;

describe("documentation contracts", () => {
  // @req SC-005
  // @req NFR-005
  it("mantem o gate minimo e o mapa canonico do DocGuard alinhados ao repo", () => {
    const packageJson = readJson<{
      scripts: Record<string, string>;
    }>("package.json");
    const docguardConfig = readJson<{
      requiredFiles: { canonical: string[] };
    }>(".docguard.json");

    expect(packageJson.scripts).toMatchObject({
      "doc:guard": "docguard guard",
      lint: "eslint .",
      test: "jest --passWithNoTests",
      typecheck: "tsc --noEmit",
    });

    expect(docguardConfig.requiredFiles.canonical).toEqual(
      expect.arrayContaining([
        "docs-canonical/ARCHITECTURE.md",
        "docs-canonical/DATA-MODEL.md",
        "docs-canonical/SECURITY.md",
        "docs-canonical/TEST-SPEC.md",
        "docs-canonical/ENVIRONMENT.md",
        "docs-canonical/REQUIREMENTS.md",
      ]),
    );

    for (const relativePath of docguardConfig.requiredFiles.canonical) {
      expect(existsSync(resolve(root, relativePath))).toBe(true);
    }
  });

  // @req NFR-004
  it("mantem suites de regressao para auth, same-day, projected tasks, timeline e regras temporais", () => {
    const requiredSuites = [
      "tests/unit/auth/auth-api.test.ts",
      "tests/unit/lib/env.test.ts",
      "tests/unit/schemas/note.schema.test.ts",
      "tests/unit/schemas/task.schema.test.ts",
      "tests/unit/tasks/task-temporal-validation.test.ts",
      "tests/unit/timeline/same-day-nodes.test.ts",
      "tests/unit/timeline/projected-task-nodes.test.ts",
      "tests/unit/timeline/derive-timeline-nodes-regression.test.ts",
      "tests/unit/timeline/timeline-view.test.tsx",
      "tests/integration/auth/auth-session-flow.test.tsx",
      "tests/integration/day/day-surface-same-day.test.tsx",
      "tests/integration/day/ghost-navigation.test.tsx",
    ];

    for (const relativePath of requiredSuites) {
      expect(existsSync(resolve(root, relativePath))).toBe(true);
    }
  });

  // @req NFR-002
  it("mantem RLS por ownership nas tabelas do baseline", () => {
    const sql = readFileSync(
      resolve(root, "supabase/migrations/001_auth_day_surface.sql"),
      "utf8",
    );
    const ownerDefaultSql = readFileSync(
      resolve(root, "supabase/migrations/002_note_echo_owner_default.sql"),
      "utf8",
    );
    const hardeningSql = readFileSync(
      resolve(root, "supabase/migrations/003_harden_note_echo_surface.sql"),
      "utf8",
    );
    const noteEchoFlowsSql = readFileSync(
      resolve(root, "supabase/migrations/002_note_echo_flows.sql"),
      "utf8",
    );
    const runbooks = readFileSync(resolve(root, "RUNBOOKS.md"), "utf8");

    expect(sql).toContain("alter table public.tags enable row level security;");
    expect(sql).toContain("alter table public.tasks enable row level security;");
    expect(sql).toContain("alter table public.notes enable row level security;");
    expect(sql).toContain(
      "alter table public.note_echoes enable row level security;",
    );

    expect(sql).toContain('create policy "tags_select_own"');
    expect(sql).toContain('create policy "tasks_select_own"');
    expect(sql).toContain('create policy "notes_select_own"');
    expect(sql).toContain('create policy "note_echoes_select_own"');
    expect(sql).toContain(
      "created_by_user_id uuid not null default auth.uid()",
    );
    expect(sql).toContain("created_by_user_id = auth.uid()");
    expect(ownerDefaultSql).toContain("alter table public.note_echoes");
    expect(ownerDefaultSql).toContain(
      "alter column created_by_user_id set default auth.uid()",
    );
    expect(hardeningSql).toContain("revoke all on table public.notes from anon");
    expect(hardeningSql).toContain(
      'alter policy "notes_select_own" on public.notes to authenticated',
    );
    expect(hardeningSql).toContain("set search_path = public");
    expect(hardeningSql).toContain("drop extension if exists pg_graphql cascade");
    expect(noteEchoFlowsSql).toContain("public.continue_note(");
    expect(noteEchoFlowsSql).toContain("security definer");
    expect(noteEchoFlowsSql).toContain("set search_path = public");
    expect(noteEchoFlowsSql).toContain("current_user_id uuid := auth.uid()");
    expect(noteEchoFlowsSql).toContain("insert into public.notes");
    expect(noteEchoFlowsSql).toContain("insert into public.note_echoes");
    expect(noteEchoFlowsSql).toContain("'continue_note'");
    expect(noteEchoFlowsSql).toContain("source_note.day");
    expect(noteEchoFlowsSql).toContain(
      "grant execute on function public.continue_note",
    );
    expect(noteEchoFlowsSql).not.toContain("service_role");
    expect(runbooks).toContain("003_harden_note_echo_surface.sql");
    expect(runbooks).toContain("supabase migration repair <version> --status applied");
  });
});
