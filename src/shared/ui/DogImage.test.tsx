import { fireEvent, render, screen } from '@testing-library/react';
import { DogImage } from './DogImage';

describe('DogImage', () => {
  it('renders a lazy image by default', () => {
    render(<DogImage src="/a.jpg" alt="Pug" className="extra" />);

    const img = screen.getByRole('img', { name: 'Pug' });
    expect(img).toHaveAttribute('src', '/a.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveClass('extra');
  });

  it('can load eagerly', () => {
    render(<DogImage src="/a.jpg" alt="Pug" loading="eager" />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
  });

  it('shows a labelled fallback when the image fails', () => {
    render(<DogImage src="/a.jpg" alt="Pug" />);
    fireEvent.error(screen.getByRole('img'));

    const fallback = screen.getByTestId('image-fallback');
    expect(fallback).toHaveAttribute('role', 'img');
    expect(fallback).toHaveAccessibleName('Pug');
    expect(fallback).toHaveTextContent('Image unavailable');
  });

  it('keeps a decorative fallback hidden from assistive tech', () => {
    const { container } = render(<DogImage src="/a.jpg" alt="" />);
    fireEvent.error(container.querySelector('img')!);

    const fallback = screen.getByTestId('image-fallback');
    expect(fallback).not.toHaveAttribute('role');
    expect(fallback).not.toHaveAttribute('aria-label');
  });

  it('retries when the source changes', () => {
    const { rerender } = render(<DogImage src="/a.jpg" alt="Pug" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('image-fallback')).toBeInTheDocument();

    rerender(<DogImage src="/b.jpg" alt="Pug" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/b.jpg');
    expect(screen.queryByTestId('image-fallback')).not.toBeInTheDocument();
  });
});
