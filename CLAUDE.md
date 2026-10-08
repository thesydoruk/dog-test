# Dog Viewer

React 19 + TypeScript + Vite. Full conventions and the e2e toolkit are in
[docs/development.md](docs/development.md); read it before adding a feature.

## Rules that are easy to break

- A component with its own styles or private sub-components lives in a folder with an
  `index.ts`; import the folder, never a file inside it. Hooks, contexts and unstyled components
  stay flat.
- Tests go in `__tests__` next to the module. E2E specs go in `e2e/` and must pass on all
  viewports (320 to 1920 px) and all three browsers.
- `features/viewer` must not import from `features/favorites`; compose in `app/App`.
- Mobile-first CSS Modules with tokens from `styles/global.css`. Motion only under
  `prefers-reduced-motion: no-preference`, hover only under `(hover: hover)`.
- No `setState` inside `useEffect` (lint error); derive state instead.
- In e2e specs, use `viewer.pickThumbnail()` / `pickFavorite()` when another click follows a
  selection; the plain locators are for assertions.
- Never let e2e tests hit the real Dog API except the `@live` smoke test.
- Always document code with TSDoc, in the same change that adds or alters it: every exported
  component, hook, function, type and constant, plus a comment on every prop and interface
  field. Say what it does and when to use it, and add `@param`, `@returns`, `@throws`, the
  required provider, `@example` for non-obvious calls and `{@link}` to related code. Props are
  named interfaces (`interface FooProps`), never inline types. Keep comments true when the code
  changes. See "Documenting code" in docs/development.md.

## Commands

- `npm run test:all` is what CI runs (Chromium e2e only). `npm run test:e2e:all` runs every
  browser and is slow on Windows.
- Unit coverage is enforced; keep it at 100%.
