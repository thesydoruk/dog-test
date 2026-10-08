import { useState } from 'react';
import styles from './DogImage.module.css';

/** Props for {@link DogImage}. */
interface DogImageProps {
  /** Photo URL. Changing it resets the loading and error state. */
  src: string;
  /**
   * Text alternative. Pass the breed name for a meaningful image, or `''` when nearby text
   * already names the dog (the image and its fallback are then hidden from assistive tech).
   */
  alt: string;
  /** Extra class for sizing or shape; applied to the image and to the fallback. */
  className?: string;
  /**
   * Native lazy loading. Use `'eager'` for the image the user sees first.
   * @defaultValue 'lazy'
   */
  loading?: 'eager' | 'lazy';
  /** Native fetch priority hint; set `'high'` on the page's main image. */
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * A dog photo that fades in once loaded and degrades gracefully.
 *
 * - Fills its container (`width/height: 100%`, `object-fit: cover`; override via `className`).
 * - Stays transparent until loaded, then fades in (no fade with reduced motion).
 * - If the photo fails, renders an "Image unavailable" box instead, labelled with `alt`, so the
 *   layout and the accessible name stay intact. A new `src` tries again.
 *
 * @example
 * ```tsx
 * <DogImage src={dog.imageUrl} alt={dog.breed.name} loading="eager" fetchPriority="high" />
 * ```
 */
export function DogImage({ src, alt, className, loading = 'lazy', fetchPriority }: DogImageProps) {
  // Tracking URLs (not booleans) resets both states as soon as `src` changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const classes = [styles.image, className].filter(Boolean).join(' ');

  if (failedSrc === src) {
    return (
      <div
        className={`${classes} ${styles.fallback}`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        data-testid="image-fallback"
      >
        <span aria-hidden="true">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      className={`${classes} ${loadedSrc === src ? styles.loaded : styles.pending}`}
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
    />
  );
}
