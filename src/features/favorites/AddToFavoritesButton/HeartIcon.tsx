/** Props for {@link HeartIcon}. */
interface HeartIconProps {
  /** Filled when the dog is a favorite, outlined otherwise. */
  filled: boolean;
}

/**
 * Decorative 20×20 heart drawn in `currentColor`, so it follows the button's text colour.
 *
 * Hidden from assistive technology; the button's text carries the meaning. Pops briefly when it
 * becomes filled (see `.button--active svg` in `global.css`), unless reduced motion is preferred.
 */
export function HeartIcon({ filled }: HeartIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7.5-4.6-9.4-9.3C1.3 7.9 3.4 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.6 3.4 4.3 6.7-1.9 4.7-9.4 9.3-9.4 9.3z" />
    </svg>
  );
}
