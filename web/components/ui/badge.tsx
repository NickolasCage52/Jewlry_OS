import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone =
  | "blue"
  | "amber"
  | "gold"
  | "gray"
  | "green"
  | "red";

const toneClass: Record<BadgeTone, string> = {
  blue: "ui-badge--blue",
  amber: "ui-badge--amber",
  gold: "ui-badge--gold",
  gray: "ui-badge--gray",
  green: "ui-badge--green",
  red: "ui-badge--red",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone: BadgeTone;
  children: ReactNode;
};

export function Badge({ tone, children, className = "", ...rest }: BadgeProps) {
  return (
    <span className={`ui-badge ${toneClass[tone]} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
