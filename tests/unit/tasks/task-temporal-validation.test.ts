import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import type { Task } from "../../../src/types/task";
import { createTask } from "../../../src/features/tasks/api/create-task";
import { updateTask } from "../../../src/features/tasks/api/update-task";

const mockSingle = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => ({
    from: mockFrom,
  }),
  getSupabaseConfigurationError: () => null,
  isSupabaseConfigured: true,
}));

const authenticatedSession: AuthenticatedSession = {
  userId: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

const existingTask: Task = {
  id: "20000000-0000-4000-8000-000000000001",
  user_id: authenticatedSession.userId,
  title: "Tarefa futura",
  content: "Conteudo",
  tag_id: null,
  color: null,
  is_color_overridden: false,
  source_day: "2026-04-18",
  target_day: "2026-04-20",
  created_at: "2026-04-18T10:00:00+00:00",
  scheduled_at: "2026-04-20T21:30:00+00:00",
  status: "open",
  completed_at: null,
  updated_at: "2026-04-18T10:00:00+00:00",
};

describe("task temporal validation regressions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-04-18T00:00:00Z"));

    mockFrom.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
    });

    mockInsert.mockReturnValue({
      select: mockSelect,
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      single: mockSingle,
    });

    useAuthStore.setState({
      status: "authenticated",
      session: authenticatedSession,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("persiste created_at alinhado com a validacao temporal da criacao", async () => {
    mockSingle.mockResolvedValue({
      data: {
        ...existingTask,
        created_at: "2026-04-18T00:00:00.000Z",
      },
      error: null,
    });

    const result = await createTask({
      title: "Nova tarefa",
      content: "",
      tag_id: null,
      color: null,
      is_color_overridden: false,
      source_day: "2026-04-18",
      target_day: "2026-04-20",
      scheduled_time: "18:30",
      status: "open",
    });

    expect(result.ok).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        created_at: "2026-04-18T00:00:00.000Z",
      }),
    );
  });

  it("permite editar tarefa antiga sem revalidar horario contra o relogio atual", async () => {
    jest.setSystemTime(new Date("2026-04-21T12:00:00Z"));

    mockSingle.mockResolvedValue({
      data: {
        ...existingTask,
        title: "Tarefa futura revisada",
      },
      error: null,
    });

    const result = await updateTask(existingTask, {
      title: "Tarefa futura revisada",
      content: existingTask.content ?? "",
      tag_id: existingTask.tag_id,
      color: existingTask.color,
      is_color_overridden: existingTask.is_color_overridden,
      source_day: existingTask.source_day,
      target_day: existingTask.target_day,
      scheduled_time: "18:30",
      status: existingTask.status,
    });

    expect(result.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
        scheduled_at: "2026-04-20T21:30:00+00:00",
        title: "Tarefa futura revisada",
      }),
    );
  });
});
