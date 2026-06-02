# Screenshots

`homepage-preview.svg` is a screenshot-style preview for the public README.

The in-app browser available during this preparation pass blocked navigation to `localhost:3000`, so
an actual browser-captured PNG could not be produced here without bypassing that policy.

To replace the preview with a real screenshot after cloning:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`, capture the homepage, and save it as:

```text
docs/screenshots/homepage.png
```
