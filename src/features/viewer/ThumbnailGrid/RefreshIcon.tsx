import styles from './RefreshIcon.module.css';

/** Props for {@link RefreshIcon}. */
interface RefreshIconProps {
  /** Spins while new dogs are loading (only without reduced motion). */
  spinning: boolean;
}

/**
 * Decorative 18×18 circular-arrow icon for the "New dogs" button, drawn in `currentColor`.
 *
 * Hidden from assistive technology; the loading state is announced by a separate status message.
 *
 * Private to `ThumbnailGrid`.
 */
export function RefreshIcon({ spinning }: RefreshIconProps) {
  return (
    <svg
      className={spinning ? styles.spinning : undefined}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}
