import type { ButtonHTMLAttributes } from "react";
import { Label } from "./Label";

type QuietControlProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** The label, from src/copy. */
  children: string;
};

/**
 * The quiet alternative beside or under a primary action: "Go without sound",
 * "Propose another", "Decline". Its text is small, so its tap area is kept at 44 px.
 */
export function QuietControl({ children, className, type = "button", ...rest }: QuietControlProps) {
  return (
    <button type={type} className={["link-quiet", className].filter(Boolean).join(" ")} {...rest}>
      <Label>{children}</Label>
    </button>
  );
}
