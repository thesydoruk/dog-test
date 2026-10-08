# Dog Viewer

A small React app that shows random dogs from the [Dog API](https://dog.ceo/dog-api/documentation).

- A random dog is shown at the top, labelled by its breed, with 10 random thumbnails below it.
- Clicking a thumbnail makes it the main image. Thumbnails grow slightly on hover.
- A favorites list (on the right from tablet width up, below the dogs on phones) holds dogs saved
  with the **Add to favorites** button. Clicking a favorite shows it as the main image, and each
  favorite has a remove button. Favorites are kept in `localStorage`, so they survive a reload.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build: `npm run build && npm run preview`.

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
    favorites/  Favorites panel, add button, reducer, context, storage
  shared/ui/  Reusable UI: image with fallback, loading and error states
  app/        App layout, providers, query client
  styles/     Design tokens and global styles
```

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
    focus order, broken-image fallback, hover growth and reduced motion.
  - Part 2: the empty state, adding, toggling, no duplicates, order, selecting a favorite,
    removing (including focus handling), persistence across reloads, long lists.
  - API errors and retry, and favorites working while the API is down.
  - Responsive layout: no horizontal scroll, favorites position, grid columns, touch targets of
    at least 44 px, sticky favorites.
  - Accessibility: axe WCAG 2.2 AA checks in light and dark themes for the loaded, favorites,
    loading and error states, plus landmarks, headings and visible focus.
- One `@live` smoke test runs against the real API. It's kept out of the main suite so outages
  of the external API can't break the build.

CI (GitHub Actions) runs lint, formatting, types, unit tests with coverage and the e2e matrix on
every push and pull request.
