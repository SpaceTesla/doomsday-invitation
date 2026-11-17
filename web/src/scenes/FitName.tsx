"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { fitOf } from "@/lib/fit";

/**
 * A container that applies the approved long-name rule to the name inside it: the name
 * wraps first; on two lines the approved fit applies; a single word too wide for the line
 * steps down once, to 80%, never smaller. Measured in the browser, again on resize.
 * `steps` limits which fits apply: the opening accepts three lines and only steps down.
 */
export function FitName({
  children,
  className,
  nameSelector,
  steps = ["two-lines", "step"],
}: {
  children: ReactNode;
  className: string;
  nameSelector: string;
  steps?: ("two-lines" | "step")[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = steps.join(",");

  useLayoutEffect(() => {
    const box = ref.current;
    const name = box?.querySelector<HTMLElement>(nameSelector);
    if (!box || !name) return;
    const measure = () => {
      delete box.dataset.fit;
      const fit = (fitOf(name) ?? "")
        .split(" ")
        .filter((part) => part && allowed.split(",").includes(part))
        .join(" ");
      if (fit) box.dataset.fit = fit;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [nameSelector, allowed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
