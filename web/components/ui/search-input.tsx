import { forwardRef, type InputHTMLAttributes } from "react";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  density?: "default" | "dense";
  variant?: "default" | "cream";
};

/** Поле поиска в стиле demo `.content-search` / `.topbar__search`. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { className = "", density = "default", variant = "default", ...rest },
    ref,
  ) {
    const cls = [
      "ui-search",
      density === "dense" ? "ui-search--dense" : "",
      variant === "cream" ? "ui-search--cream" : "",
      "ui-focusable",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <input ref={ref} type="search" className={cls} {...rest} />;
  },
);
