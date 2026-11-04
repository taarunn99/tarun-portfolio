import type { ElementType, ReactNode } from "react";

type Props = {
  as?: ElementType;
  className?: string;
  id?: string;
  /** Plain text; the first occurrence of `accent` is wrapped in the italic serif */
  text: string;
  accent?: string;
  children?: ReactNode;
};

/**
 * Heading with at most one italic accent word (docs/DESIGN_CONCEPT.md §3).
 * Renders real text — no splitting here, so it is always the LCP-safe default.
 */
export function Heading({ as, className, id, text, accent, children }: Props) {
  const Tag = (as ?? "h2") as ElementType;
  if (!accent || !text.includes(accent)) {
    return (
      <Tag className={className} id={id}>
        {text}
        {children}
      </Tag>
    );
  }
  const [before, after] = text.split(accent, 2);
  return (
    <Tag className={className} id={id}>
      {before}
      <em className="accent-word">{accent}</em>
      {after}
      {children}
    </Tag>
  );
}
