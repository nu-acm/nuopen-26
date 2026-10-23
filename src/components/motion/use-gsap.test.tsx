// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { gsap } from "./gsap";
import { useGsap } from "./use-gsap";

function Box({ onCleanup }: { onCleanup?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useGsap(() => {
    gsap.set(".box", { opacity: 0.5 });
    return onCleanup;
  }, root);
  return (
    <div ref={root}>
      <div className="box" data-testid="box" />
    </div>
  );
}

describe("useGsap", () => {
  afterEach(cleanup);

  it("should undo its tweens when the component unmounts", () => {
    const { getByTestId, unmount } = render(<Box />);
    const box = getByTestId("box");
    expect(box.style.opacity).toBe("0.5");
    unmount();
    expect(box.style.opacity).toBe("");
  });

  it("should run the cleanup the setup returns", () => {
    const onCleanup = vi.fn();
    const { unmount } = render(<Box onCleanup={onCleanup} />);
    unmount();
    expect(onCleanup).toHaveBeenCalledTimes(1);
  });
});
