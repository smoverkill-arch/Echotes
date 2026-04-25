import { installMockSystemDate } from "../../support/mock-system-date";

describe("installMockSystemDate", () => {
  it("mantem Date() sem new alinhado ao timestamp simulado", () => {
    const renderExpectedString = (iso: string) =>
      new globalThis.Date(iso).toString();
    const mockDate = installMockSystemDate("2026-04-18T12:34:56.000Z");

    try {
      expect(Date()).toBe(renderExpectedString("2026-04-18T12:34:56.000Z"));

      mockDate.set("2026-04-20T08:00:00.000Z");

      expect(Date()).toBe(renderExpectedString("2026-04-20T08:00:00.000Z"));
    } finally {
      mockDate.restore();
    }
  });
});
