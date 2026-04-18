import { forwardRef, type InputHTMLAttributes } from "react";

/** Поле поиска в топбаре (demo `.topbar__search`). */
export const TopbarSearch = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function TopbarSearch({ className = "", ...rest }, ref) {
  return (
    <input
      ref={ref}
      type="search"
      className={`ui-topbar-search ui-focusable ${className}`.trim()}
      {...rest}
    />
  );
});
