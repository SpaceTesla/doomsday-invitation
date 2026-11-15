import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
  /** The id of the heading inside, so the panel is announced by its name. */
  labelledBy?: string;
};

/**
 * A steel plate that holds one part of the council. Never nest a panel in a panel:
 * use a Well.
 */
export function Panel({ children, className, labelledBy }: PanelProps) {
  return (
    <section
      className={["panel-plate", className].filter(Boolean).join(" ")}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}

/** A recessed strip inside a panel, for counts and lists. */
export function Well({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["panel-well", className].filter(Boolean).join(" ")}>{children}</div>;
}

/** The row of actions at the foot of a panel: one primary button, one quiet control. */
export function PanelActions({ children }: { children: ReactNode }) {
  return <div className="panel-acts">{children}</div>;
}
