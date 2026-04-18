import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: boolean;
  hover?: boolean;
};

export function Card({
  children,
  className = "",
  padding = false,
  hover = false,
  ...rest
}: CardProps) {
  const cls = [
    "ui-card",
    padding ? "ui-card--padding" : "",
    hover ? "ui-card--hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
