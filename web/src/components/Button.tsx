import type { ButtonHTMLAttributes } from "react";
import { Label } from "./Label";
import { SealMark } from "./Mark";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** The label, from src/copy. It says what happens: "Take your seat", "Approve". */
  children: string;
  /** The action has been taken and stands, as "Approved" does. Shown by the word too. */
  done?: boolean;
};

/**
 * The primary action: a small steel plate carrying the seal mark.
 * One per screen. It acts on an ordinary press; the emerald fill is feedback only.
 */
export function Button({
  children,
  done = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={["btn-plate", done && "is-done", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <SealMark />
      <Label>{children}</Label>
    </button>
  );
}
