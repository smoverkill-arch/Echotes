import { taskFormSchema, timeStringSchema } from "../../../src/schemas/task.schema";
import { TIME_KEY_ERROR_MESSAGE } from "../../../src/utils/date";

describe("task time validation", () => {
  it.each(["00:00", "09:30", "23:59"])(
    "aceita horarios validos no schema: %s",
    (value) => {
      expect(timeStringSchema.parse(value)).toBe(value);
    },
  );

  it.each(["24:00", "29:99", "12:60", "12:75", "7:30", "1234"])(
    "rejeita horarios invalidos no schema: %s",
    (value) => {
      const parsed = timeStringSchema.safeParse(value);

      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0]?.message).toBe(TIME_KEY_ERROR_MESSAGE);
    },
  );

  it("mantem scheduled_time opcional sem aceitar horario impossivel", () => {
    const parsed = taskFormSchema.safeParse({
      title: "Tarefa",
      content: "",
      source_day: "2026-04-18",
      target_day: "2026-04-18",
      scheduled_time: "29:99",
      status: "open",
      tag_id: null,
      color: null,
      is_color_overridden: false,
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe(TIME_KEY_ERROR_MESSAGE);
  });

  it("trata scheduled_time com apenas espacos como ausencia de horario", () => {
    const parsed = taskFormSchema.safeParse({
      title: "Tarefa",
      content: "",
      source_day: "2026-04-18",
      target_day: "2026-04-18",
      scheduled_time: "   ",
      status: "open",
      tag_id: null,
      color: null,
      is_color_overridden: false,
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.scheduled_time).toBeNull();
  });
});
