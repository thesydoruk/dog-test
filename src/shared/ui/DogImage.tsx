import { useState } from 'react';
import styles from './DogImage.module.css';

interface DogImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function DogImage({ src, alt, className, loading = 'lazy' }: DogImageProps) {
  // Tracking the failed URL (not a boolean) resets the fallback as soon as `src` changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
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
      className={classes}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );
}
