import { screen, waitFor, within } from '@testing-library/react';
import { delay, http } from 'msw';
import { mainDog } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { apiError, randomDogUrl, server, success } from '@/test/server';
import { MainDog } from './MainDog';

const region = () => screen.getByRole('region', { name: 'Featured dog' });

describe('MainDog', () => {
  it('shows a loading state, then the random dog labelled by breed', async () => {
    server.use(
      http.get(randomDogUrl, async () => {
        await delay(20);
        return success(mainDog.imageUrl);
      }),
    );
    renderWithProviders(<MainDog />);

    expect(within(region()).getByRole('status')).toHaveTextContent('Loading a dog…');

    const image = await within(region()).findByRole('img', { name: 'Afghan Hound' });
    expect(image).toHaveAttribute('src', mainDog.imageUrl);
    expect(image).toHaveAttribute('loading', 'eager');
    expect(screen.getByTestId('main-dog-breed')).toHaveTextContent('Afghan Hound');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders actions for the shown dog', async () => {
    const renderActions = vi.fn(() => <button type="button">Act</button>);
    renderWithProviders(<MainDog renderActions={renderActions} />);

    expect(await screen.findByRole('button', { name: 'Act' })).toBeInTheDocument();
    expect(renderActions).toHaveBeenLastCalledWith(mainDog);
  });

  it('shows an error and recovers on retry', async () => {
    let fail = true;
    server.use(http.get(randomDogUrl, () => (fail ? apiError() : success(mainDog.imageUrl))));
    const { user } = renderWithProviders(<MainDog />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't fetch a dog right now.");

    fail = false;
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('img', { name: 'Afghan Hound' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
