import { describe, expect, it } from "vitest";

import { INTRO_KEY, INTRO_SCRIPT } from "./intro";

describe("INTRO_SCRIPT", () => {
  const run = (env: { seen?: boolean; reduced?: boolean; hash?: string }) => {
    const dataset: Record<string, string> = {};
    const fn = new Function("sessionStorage", "matchMedia", "location", "document", INTRO_SCRIPT);
    fn(
      { getItem: (k: string) => (k === INTRO_KEY && env.seen ? "1" : null) },
      () => ({ matches: !!env.reduced }),
      { hash: env.hash ?? "" },
      { documentElement: { dataset } },
    );
    return dataset.intro;
  };

  it("should mark the page for the intro on a first visit", () => {
    expect(run({})).toBe("1");
    expect(run({ hash: "#" })).toBe("1");
  });

  it("should leave the page unmarked when the intro was seen", () => {
    expect(run({ seen: true })).toBeUndefined();
  });

  it("should leave the page unmarked for reduced motion or a deep link", () => {
    expect(run({ reduced: true })).toBeUndefined();
    expect(run({ hash: "#faq" })).toBeUndefined();
  });

  it("should not throw when storage is blocked", () => {
    const fn = new Function("sessionStorage", "matchMedia", "location", "document", INTRO_SCRIPT);
    const blocked = { getItem: () => { throw new Error("blocked"); } };
    expect(() => fn(blocked, () => ({ matches: false }), { hash: "" }, { documentElement: { dataset: {} } })).not.toThrow();
  });
});
