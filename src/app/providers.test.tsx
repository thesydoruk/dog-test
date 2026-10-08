import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { AppProviders } from './providers';

function StaleTime() {
  const staleTime = useQueryClient().getDefaultOptions().queries?.staleTime;
  return <span>{String(staleTime)}</span>;
}

describe('AppProviders', () => {
  it('creates the app query client when none is given', () => {
    render(
      <AppProviders>
        <StaleTime />
      </AppProviders>,
    );

    expect(screen.getByText('Infinity')).toBeInTheDocument();
  });
});
