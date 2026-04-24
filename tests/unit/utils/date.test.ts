import {
  buildDayTimeIso,
  extractTimePart,
  formatDisplayDay,
  parseDisplayDayInput,
} from "../../../src/utils/date";

describe("date helpers", () => {
  it("converte day key YYYY-MM-DD para DD-MM-AAAA", () => {
    expect(formatDisplayDay("2026-04-18")).toBe("18-04-2026");
  });

  it("converte DD-MM-AAAA para day key YYYY-MM-DD", () => {
    expect(parseDisplayDayInput("18-04-2026")).toBe("2026-04-18");
  });

  it("tolera tecnicamente YYYY-MM-DD sem incentivar esse formato na UI", () => {
    expect(parseDisplayDayInput("2026-04-18")).toBe("2026-04-18");
  });

  it("interpreta HH:mm no fuso local e persiste o instante correspondente em UTC", () => {
    const scheduledAt = buildDayTimeIso("2026-04-18", "20:15");
    const expected = `${new Date(2026, 3, 18, 20, 15, 0, 0)
      .toISOString()
      .slice(0, 19)}+00:00`;

    expect(scheduledAt).toBe(expected);
    expect(extractTimePart(scheduledAt).slice(0, 5)).toBe("20:15");
  });
});
