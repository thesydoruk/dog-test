import { useState } from 'react';
import styles from './DogImage.module.css';

interface DogImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

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
