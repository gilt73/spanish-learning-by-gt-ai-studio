# Spanish Learning App - Agent Rules

## Version Upgrade & Deployment Checklist
The user has experienced repeated issues where version upgrades or deployments were incomplete. From now on, whenever you are asked to "upgrade the version", "bump the version", or "deploy a new version", you MUST systematically check and update ALL of the following places:

1. **`version.json`**: Update the `version` field to the new version string (e.g., `"2.1.2"`).
2. **`index.html`**: Locate the `<p id="settings-version">` tag in the settings menu and update the hardcoded version string to precisely match `version.json` (e.g., `v2.1.2`). *Failure to do this will break the PWA update check loop!*
3. **`sw.js` (Service Worker)**: 
   - Update the `CACHE_NAME` constant (e.g., `spanish-learning-v2.1.2`).
   - Double-check that `ASSETS_TO_CACHE` includes all new critical files (like `songs.json`).
4. **`package.json`** & **`package-lock.json`** (Optional but recommended): Update the version strings here if doing a major/minor bump.
5. **Git Commit & Push**: Commit all the updated files and push them to `origin main` to trigger the Vercel GitHub integration.

DO NOT skip any of these steps. This is a strict project requirement to guarantee flawless PWA deployments.
