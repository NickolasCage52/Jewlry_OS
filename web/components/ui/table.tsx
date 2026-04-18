import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export function Table({
  className = "",
  ...rest
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="ui-table-wrap">
      <table className={`ui-table ${className}`.trim()} {...rest} />
    </div>
  );
}

export function Thead({
  className = "",
  ...rest
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...rest} />;
}

export function Tbody({
  className = "",
  ...rest
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...rest} />;
}

export function Tr({
  className = "",
  ...rest
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={className} {...rest} />;
}

export function Th({
  className = "",
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={className} {...rest} />;
}

export function Td({
  className = "",
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={className} {...rest} />;
}
