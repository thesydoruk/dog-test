import type { ReactNode } from 'react';

/** Props for {@link Loading}. */
interface LoadingProps {
  /** Announced to screen readers, e.g. "Loading more dogs…". Not visible. */
  label: string;
  /** The visual placeholder, usually skeleton blocks with the `skeleton` class. */
  children: ReactNode;
}

/**
 * A loading state: shows a visual skeleton and announces `label` to assistive technology.
 *
 * The skeleton is hidden from screen readers (`aria-hidden`), and the label lives in a
 * `role="status"` region, so users hear one short message instead of empty boxes.
 *
 * @example
 * ```tsx
 * <Loading label="Loading a dog…">
 *   <div className="skeleton" style={{ aspectRatio: '4 / 3' }} />
 * </Loading>
 * ```
 */
export function Loading({ label, children }: LoadingProps) {
  return (
    <div role="status">
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
