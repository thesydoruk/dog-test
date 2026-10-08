import type { ReactNode } from 'react';

interface LoadingProps {
  label: string;
  children: ReactNode;
}

/** Announces a loading state to assistive tech while rendering a visual skeleton. */
export function Loading({ label, children }: LoadingProps) {
  return (
    <div role="status">
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
