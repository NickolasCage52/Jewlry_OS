import type { ButtonHTMLAttributes } from "react";

export type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
};

export function FilterChip({
  pressed = false,
  className = "",
  type = "button",
  ...rest
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={`ui-filter-chip ui-focusable ${className}`.trim()}
      {...rest}
    />
  );
}
