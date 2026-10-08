# Development guide

How to work on Dog Viewer without breaking the conventions it was built on. The
[README](../README.md) covers running the app and the high-level architecture; this page
covers what you need to know before adding a feature.

## Project conventions

- **Component folders.** A component that has its own styles, or private sub-components that
  nothing else uses, lives in a folder with an `index.ts`:

  ```text
  features/viewer/ThumbnailGrid/
    ThumbnailGrid.tsx          the public component
    ThumbnailGrid.module.css
    Thumbnail.tsx              private, only used by ThumbnailGrid
    RefreshIcon.tsx            private
    index.ts                   export { ThumbnailGrid } from './ThumbnailGrid';
    __tests__/ThumbnailGrid.test.tsx
  ```

  Importers use the folder path (`@/features/viewer/ThumbnailGrid`) and never reach inside it.
  If a private sub-component becomes shared, move it to `shared/ui/` or its own folder.

- **Flat modules.** Hooks, contexts, reducers, pure functions and unstyled components stay flat
  (`useCurrentDog.ts`, `SelectionContext.tsx`, `Loading.tsx`).
- **Tests next to the code.** Unit and component tests go in a `__tests__` folder beside the
  module. End-to-end tests live in `e2e/`.
- **Features don't import each other.** `viewer` knows nothing about `favorites`. `App`
  composes them: the favorites button is passed into `MainDog` through `renderActions`.
- **Styling.** CSS Modules per component, design tokens from `styles/global.css`
  (`--space-*`, `--color-*`, `--radius-*`, `--touch-target`). Write mobile-first: base styles
  are for phones, `min-width` breakpoints at 480, 768, 1024 and 1440 px add to them. Hover
  effects go under `@media (hover: hover)`; any motion goes under
  `@media (prefers-reduced-motion: no-preference)`.
- **Imports.** Use the `@/` alias for anything outside the current folder.
- **Lint rules worth knowing.** `eslint-plugin-react-hooks` v7 is on, so `setState` inside
  `useEffect` is an error. Derive state instead (see `FavoritesAnnouncer`, which reads
  `lastChange` from the reducer rather than diffing in an effect).
- **Documentation.** Every piece of code is documented with TSDoc in the same change that adds
  or alters it. See [Documenting code](#documenting-code).

## Documenting code

The goal is that hovering anything in the IDE explains it without opening the file. Document in
the same commit as the code, and update the comment whenever the behaviour changes; a stale
comment is worse than none.

**What gets a TSDoc comment (`/** … */`):**

- Every exported component, hook, function, class, type, interface and constant.
- Every prop and interface field, one comment per field, because VS Code shows it when you hover
  the prop in JSX.
- Non-exported helpers when their purpose or a constraint isn't obvious from the name.
- A module that groups related exports (e.g. `api/dogApi.ts`) gets a top-of-file `@module` block.

**What the comment says:**

- What it does and when to use it, from the caller's point of view. Not a restatement of the name.
- Behaviour that matters to the caller: states (loading, error, empty), accessibility,
  responsive behaviour, side effects (storage, scrolling, focus), what stays stable between renders.
- `@param` for each parameter and `@returns` for the result.
- `@throws` for each error a caller can get, including when no request is made.
- The provider it must be rendered inside, if any.
- `@example` when the call isn't obvious, `@defaultValue` for defaulted props,
  `{@link Name}` to related code (it renders as a link in the hover).

**Props are named interfaces**, never inline types, so each prop can carry its own comment:

```tsx
/** Props for {@link Thumbnail}. */
interface ThumbnailProps {
  /** The dog to show. */
  dog: Dog;
  /** Whether this dog is the main image right now; highlights the card and sets `aria-pressed`. */
  selected: boolean;
  /** Called when the card is clicked or activated with Enter / Space. */
  onSelect: (dog: Dog) => void;
}

/**
 * A square-cropped dog photo with its breed name, as one button.
 *
 * The breed name is the button's accessible name (the image itself is decorative). …
 */
export function Thumbnail({ dog, selected, onSelect }: ThumbnailProps) {
```

`index.ts` re-exports need no comments: TypeScript shows the original declaration's docs.
Inline `//` comments are for the _why_ of a tricky line inside a function body, not a substitute
for TSDoc. Tests document themselves through their names and need no TSDoc.

## Adding a feature: checklist

1. **Component** in its folder (or flat, per the rules above), with TSDoc on the component and
   every prop (see [Documenting code](#documenting-code)). Keep it accessible: real
   `<button>`s, `aria-pressed` for selection, labels on icon-only controls, `role="status"` for
   things that change without focus.
2. **Unit / component test** in `__tests__`. Use `renderWithProviders` from `src/test/render.tsx`
   (wires up TanStack Query, favorites and selection) and MSW handlers from `src/test/server.ts`
   for the API. Coverage thresholds are 95/95/90/95 and currently sit at 100%; CI fails below
   the threshold.
3. **E2E test** in `e2e/`. Every spec runs on all 15 projects (3 browsers × 5 viewports), so
   write assertions that hold at 320 px and 1920 px alike. Branch on
   `viewer.viewportWidth < SIDEBAR_BREAKPOINT` only when the layout genuinely differs.
4. **Page Object.** Add locators and actions to `e2e/support/DogViewerPage.ts` rather than
   querying in specs. Prefer role-based locators.
5. **Mock API.** If the feature needs new data, extend `e2e/support/dogApiMock.ts` and the
   fixtures in `e2e/support/fixtures.ts`. Never let an e2e test reach `dog.ceo`; only the
   `@live` smoke test does.
6. **README** if the user-facing behaviour changed.

## API client: what is already wired up

`api/dogApi.ts` covers more of the Dog API than the UI uses today, so a breed filter or a breed
gallery only needs a hook and components:

| Function                         | Endpoint                               | Notes                                                        |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| `fetchRandomDog()`               | `/breeds/image/random`                 | main image                                                   |
| `fetchRandomDogs(n)`             | `/breeds/image/random/{n}`             | thumbnails, `n` ≤ 50                                         |
| `fetchBreeds()`                  | `/breeds/list/all`                     | 100+ breeds with sub-breeds, parsed by `domain/breedCatalog` |
| `fetchRandomDogsByBreed(ref, n)` | `/breed/{b}[/{sub}]/images/random/{n}` | `ref` is `{ breed, subBreed? }`                              |
| `fetchBreedImages(ref)`          | `/breed/{b}[/{sub}]/images`            | every photo (hundreds); page it on the client                |

Breed slugs are validated (`[a-z0-9]+`) before they reach a URL. Query keys for all of these are
in `api/queryKeys.ts` (`dogKeys.*`, `breedKeys.list()`). The MSW server (`src/test/server.ts`)
and the Playwright mock (`setBreeds`, `setBreedImages`, 404 for unknown breeds) already answer
these endpoints with fixtures, so tests for new features need no mock plumbing.

## The e2e toolkit

`e2e/support/test.ts` extends Playwright's `test` with two fixtures:

- `dogApi` (`DogApiMock`) intercepts `https://dog.ceo/api/**` and `https://images.dog.ceo/**`
  before the page loads. Images are served as small SVG placeholders.
  - `setRandomDog('error')` / `setRandomDogs('error')`: make an endpoint return 500.
  - `queueThumbnails(urls)`: serve a different set on the next thumbnails request
    (used by the "New dogs" flow).
  - `breakImage(url)`: make one image 404 to exercise the fallback.
  - `holdResponses()`: freeze every API response until the returned function is called, to
    observe loading states.
  - `requests`: a counter per endpoint, handy for asserting retries.
- `viewer` (`DogViewerPage`) is the page object. `open()` loads the page and waits for the main
  dog and all 10 thumbnails.

### Why `pickThumbnail` / `pickFavorite` exist

Picking a dog smooth-scrolls the main image into view. Playwright can click the next element
while the page is still moving, so the click lands somewhere else (seen in Firefox and WebKit).
`pickThumbnail`, `pickFavorite` and `pickThumbnailAt` click and then `waitForScrollEnd()`.
Use them whenever a click follows a selection; use the plain locators (`thumbnail(breed)`) for
assertions and hover.

### Running e2e locally

| Command                                                               | Scope                             |
| --------------------------------------------------------------------- | --------------------------------- |
| `npm run test:e2e`                                                    | Chromium, 5 viewports (~1 min)    |
| `npm run test:e2e:firefox` / `:webkit`                                | one browser, 5 viewports          |
| `npm run test:e2e:all`                                                | the full matrix (slow on Windows) |
| `npx playwright test e2e/favorites.spec.ts --project=chromium-mobile` | one spec, one project             |
| `npm run test:e2e:ui`                                                 | Playwright UI mode                |

## Known quirks

- **Firefox and WebKit are slow on Windows** when headless: software rendering, and they barely
  scale with parallel workers. That's why `test:e2e` is Chromium-only and the Playwright
  timeouts are generous (60 s per test, 10 s per expect). CI runs the full matrix on Linux.
- **Vite binds to `::1`.** `localhost` works in browsers, but `127.0.0.1` doesn't. The e2e
  web server is started with `--host 127.0.0.1` for that reason.
- **Safari doesn't tab to links.** The favorites jump link is skipped in WebKit's tab order, and
  the focus-order test accounts for it.
- **Random endpoints and caching.** `staleTime` is `Infinity` and refetch-on-focus is off,
  otherwise TanStack Query would silently replace the dogs on screen. New data only arrives
  when the user asks ("New dogs", "Try again").
- **Breed names come from URLs.** The random endpoints return only image URLs, so
  `domain/breed.ts` parses `/breeds/hound-afghan/…` into "Afghan Hound". Sub-breeds come after
  the breed in the slug but before it in the name.
- **`FavoritesState.lastChange`** exists so the live region can announce changes without an
  effect. Keep updating it in the reducer when you add new actions.

## Quality gates

`npm run test:all` runs what CI runs locally (lint, Prettier, types, unit tests with coverage,
Chromium e2e). CI additionally runs Firefox and WebKit and a live smoke test against the real
API; the live job can fail without blocking the build.

## Deployment

```text
push to main ──► CI (lint · unit · e2e ×3 browsers · image build)
                  └─ success ──► CD: publish ghcr.io/thesydoruk/dog-viewer:{sha-xxxxxxx,main,latest}
                                   └──► deploy to `production` over SSH (skipped until secrets exist)
```

The app is a static bundle served by nginx (`Dockerfile`, `infra/nginx.conf`). On the host it runs
as one container from `infra/docker-compose.prod.yml`, published on `WEB_PORT` (default 3060);
`infra/deploy/remote-deploy.sh` pulls the tag, recreates the container, waits for the health check
and prunes old images. Rollback: **Actions → CD → Run workflow** with an older `sha-…` tag.

### Target host

Any Linux host with Docker Engine and the Compose plugin. The stack lives in `DEPLOY_PATH`
(default `/opt/dog-viewer`) and listens on `WEB_PORT` (default 3060); put a TLS-terminating
reverse proxy in front of it if it is exposed to the internet. Hosts, users, keys and paths are
never committed: they live in the GitHub `production` environment and in your own SSH config.

Manual deploy from a machine that can SSH to the host (`<host>` is an alias from your
`~/.ssh/config`):

```bash
ssh <host> 'mkdir -p /opt/dog-viewer'
scp infra/docker-compose.prod.yml infra/deploy/remote-deploy.sh <host>:/opt/dog-viewer/
ssh <host> 'cd /opt/dog-viewer && IMAGE_TAG=main bash remote-deploy.sh'
```

### One-time setup for automatic deploys

1. Create a dedicated key pair and authorise its public key on the target host (and on the
   bastion, if the host is only reachable through one):

   ```bash
   ssh-keygen -t ed25519 -N '' -C dog-viewer-deploy -f ~/.ssh/dog-viewer-deploy
   ssh <host> 'cat >> ~/.ssh/authorized_keys' < ~/.ssh/dog-viewer-deploy.pub
   ```

2. Collect the pinned host keys of every machine the workflow will connect to (the workflow never
   trusts a host on first use): `ssh-keyscan -t ed25519 [-p <port>] <hostname>`. For a host behind
   a bastion, run `ssh-keyscan` from the bastion and make sure the line starts with the name or
   address the workflow uses in `DEPLOY_HOST`.

3. Create the `production` environment (Settings → Environments) and add its secrets:

   | Secret               | Value                                                         |
   | -------------------- | ------------------------------------------------------------- |
   | `DEPLOY_HOST`        | host name or IP of the target                                 |
   | `DEPLOY_USER`        | SSH user allowed to run `docker`                              |
   | `DEPLOY_JUMP`        | `user@bastion[:port]`, only if the target is behind a bastion |
   | `DEPLOY_SSH_KEY`     | contents of `~/.ssh/dog-viewer-deploy`                        |
   | `DEPLOY_KNOWN_HOSTS` | the `ssh-keyscan` output from step 2                          |

   With `gh`: `gh secret set DEPLOY_SSH_KEY -e production < ~/.ssh/dog-viewer-deploy` and so on.
   Optional variables: `DEPLOY_PATH`, `WEB_PORT`, `DEPLOY_URL` (shown on the deployment).
   Add required reviewers to the environment if a deploy should wait for approval.

The deploy key grants shell access to the host, so keep it only in the GitHub environment and
rotate it by repeating step 1 with a new pair.
