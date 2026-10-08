# Dog Viewer

A small React app that shows random dogs from the [Dog API](https://dog.ceo/dog-api/documentation).

- A random dog is shown at the top, labelled by its breed, with 10 random thumbnails below it.
  **New dogs** loads another set of thumbnails.
- Clicking a thumbnail makes it the main image and scrolls it into view when it's off screen.
  Thumbnails grow slightly on hover.
- A favorites list (on the right from tablet width up, below the dogs on phones) holds dogs saved
  with the **Add to favorites** button. Clicking a favorite shows it as the main image, and each
  favorite has a remove button. Favorites are kept in `localStorage`, so they survive a reload.
  On phones a **Favorites (n)** link next to the button jumps to the list, and every change is
  announced to screen readers.

## Run it without cloning

Every green build on `main` publishes a public image to GitHub Container Registry. Only Docker is
needed:

```bash
docker run --rm -p 3060:80 ghcr.io/thesydoruk/dog-viewer:latest
# open http://localhost:3060
```

Or keep it running with Compose, using the same stack file the deployment uses:

```bash
mkdir dog-viewer && cd dog-viewer
curl -fsSLO https://raw.githubusercontent.com/thesydoruk/dog-test/main/infra/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d            # http://localhost:3060
WEB_PORT=8080 docker compose -f docker-compose.prod.yml up -d   # another port
docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d  # update
```

Tags: `latest` and `main` follow the latest green commit, `sha-<short>` pins one build.

## Getting started from source

Requires Node.js 20 or newer (22 recommended) and npm.

```bash
git clone https://github.com/thesydoruk/dog-test.git
cd dog-test
npm install                 # dependencies
npx playwright install      # browsers for the e2e tests (one-time)

npm run dev                 # http://localhost:5173
```

Checks and tests:

```bash
npm run lint                # ESLint
npm run typecheck           # TypeScript
npm test                    # unit and component tests
npm run test:e2e            # e2e in Chromium at five screen sizes
npm run test:all            # everything CI runs
```

Production build and a local preview of it:

```bash
npm run build
npm run preview             # http://localhost:4173
```

Or run the production image with Docker (static bundle behind nginx):

```bash
docker build -t dog-viewer .
docker run --rm -p 3060:80 dog-viewer    # http://localhost:3060
```

## Scripts

| Script                                         | What it does                                                   |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                                  | Start the dev server                                           |
| `npm run build`                                | Type-check and build for production                            |
| `npm run lint`                                 | ESLint                                                         |
| `npm run typecheck`                            | TypeScript, no emit                                            |
| `npm test`                                     | Unit and component tests (Vitest)                              |
| `npm run test:coverage`                        | Same, with a coverage report and enforced thresholds           |
| `npm run test:e2e`                             | E2E tests in Chromium at every screen size (fast local loop)   |
| `npm run test:e2e:all`                         | E2E tests in Chromium, Firefox and WebKit at every screen size |
| `npm run test:e2e:firefox` / `test:e2e:webkit` | One browser at every screen size                               |
| `npm run test:e2e:ui`                          | Playwright UI mode                                             |
| `npm run test:e2e:live`                        | One smoke test against the real Dog API                        |
| `npm run test:all`                             | Lint, types, unit tests with coverage and Chromium e2e tests   |

Before the first e2e run, install the browsers: `npx playwright install`.

> Headless Firefox on Windows renders in software and barely benefits from parallel workers, so
> the full matrix is slow locally (around 5 minutes for Firefox alone). CI runs the full matrix on
> Linux, with one job per browser.

## Architecture

```text
src/
  api/        Typed Dog API client and TanStack Query keys
  domain/     Dog and Breed models, breed parsing from image URLs
  features/
    viewer/     Main dog, thumbnail grid, selection state, data hooks
    favorites/  Favorites panel, add button, jump link, announcer, reducer, context, storage
  shared/ui/  Reusable UI: image with fallback and fade-in, loading and error states
  shared/dom/ Scrolling helpers that respect reduced motion
  app/        App layout, providers, query client
  styles/     Design tokens and global styles
```

Conventions:

- A component that has its own styles, or private sub-components nobody else uses, lives in a
  folder with an `index.ts` (`features/viewer/ThumbnailGrid/` holds `Thumbnail` and
  `RefreshIcon`). Importers use the folder path and never reach inside it.
- Plain modules (hooks, contexts, pure functions, unstyled components) stay flat.
- Tests live in a `__tests__` folder next to the code they cover.

Working on the code? See [docs/development.md](docs/development.md) for the feature checklist,
the e2e toolkit and known quirks.

- **Server state** lives in [TanStack Query](https://tanstack.com/query). Random endpoints return
  new dogs on every call, so background refetching is turned off; the user only gets new data
  when they retry.
- **Client state** uses React Context: the selected dog (`SelectionContext`) and favorites
  (`FavoritesContext` with a pure reducer, persisted to `localStorage`).
- **Features are decoupled.** The viewer doesn't import favorites. `App` composes them, passing
  the favorites button into the main dog through a render prop.
- **Breed names** come from the image URL (`/breeds/hound-afghan/…` becomes "Afghan Hound"),
  because the random endpoints return only image URLs.
- **Mobile first.** Base styles target phones. `min-width` breakpoints at 480, 768 (favorites
  move to the right), 1024 and 1440 px add columns. Hover effects only apply on devices that can
  hover, and animation respects `prefers-reduced-motion`. Light and dark themes follow the
  system setting.

## Testing

- **Unit and component tests** (Vitest, React Testing Library, MSW) cover the domain, the API
  client, the reducer, storage, every component and the full app flow. Coverage is held at 100%,
  and thresholds are enforced in CI.
- **E2E tests** (Playwright) run in Chromium, Firefox and WebKit at five screen sizes: 320, 390,
  768, 1280 and 1920 px wide. The Dog API and image CDN are mocked with deterministic fixtures, so
  the runs are fast and stable. The tests cover:
  - Part 1: initial display, loading placeholders, thumbnail selection by mouse and keyboard,
    scrolling the chosen dog into view, focus order, broken-image fallback, hover growth,
    reduced motion and loading a new set of dogs.
  - Part 2: the empty state, adding, toggling, no duplicates, order, selecting a favorite,
    removing (including focus handling), persistence across reloads, long lists, the jump
    link on phones and screen reader announcements.
  - API errors and retry, and favorites working while the API is down.
  - Responsive layout: no horizontal scroll, favorites position, grid columns, touch targets of
    at least 44 px, sticky favorites.
  - Accessibility: axe WCAG 2.2 AA checks in light and dark themes for the loaded, favorites,
    loading and error states, plus landmarks, headings and visible focus.
- One `@live` smoke test runs against the real API. It's kept out of the main suite so outages
  of the external API can't break the build.

CI (GitHub Actions) runs lint, formatting, types, unit tests with coverage and the e2e matrix on
every push and pull request.
