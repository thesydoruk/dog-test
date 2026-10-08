import styles from './ErrorState.module.css';

/** Props for {@link ErrorState}. */
interface ErrorStateProps {
  /** What went wrong, in plain words for the user (not a technical error message). */
  message: string;
  /** Called by the "Try again" button, typically a query's `refetch`. */
  onRetry: () => void;
}

/**
 * An inline error box with a "Try again" button.
 *
 * Uses `role="alert"`, so screen readers announce the message as soon as it appears. Meant to
 * replace the content of the section that failed, so the rest of the page keeps working.
 *
 * @example
 * ```tsx
 * if (isError) return <ErrorState message="We couldn't fetch more dogs." onRetry={() => void refetch()} />;
 * ```
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.message}>{message}</p>
      <button type="button" className="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
