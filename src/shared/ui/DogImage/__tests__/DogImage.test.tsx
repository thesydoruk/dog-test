import { fireEvent, render, screen } from '@testing-library/react';
import { DogImage } from '../DogImage';

describe('DogImage', () => {
  it('renders a lazy image by default', () => {
    render(<DogImage src="/a.jpg" alt="Pug" className="extra" />);

    const img = screen.getByRole('img', { name: 'Pug' });
    expect(img).toHaveAttribute('src', '/a.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).not.toHaveAttribute('fetchpriority');
    expect(img).toHaveClass('extra');
  });

  it('can load eagerly with a high priority', () => {
    render(<DogImage src="/a.jpg" alt="Pug" loading="eager" fetchPriority="high" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('fades the image in once it has loaded', () => {
    const { rerender } = render(<DogImage src="/a.jpg" alt="Pug" />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('pending');

    fireEvent.load(img);
    expect(img).toHaveClass('loaded');

    // A new source starts hidden again until it loads.
    rerender(<DogImage src="/b.jpg" alt="Pug" />);
    expect(screen.getByRole('img')).toHaveClass('pending');
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
