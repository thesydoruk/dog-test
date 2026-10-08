import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  it('announces the label and hides the skeleton from assistive tech', () => {
    render(
      <Loading label="Loading dogs">
        <div data-testid="skeleton" />
      </Loading>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading dogs');
    expect(screen.getByTestId('skeleton').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});
