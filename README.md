# Paperflow — GitHub Pages-ready MVP

## Deploy on GitHub Pages
This project is configured for a repository named `paperflow` under `anythingbutnotnpc`.
Expected public URL: https://anythingbutnotnpc.github.io/paperflow/

1. Create a **public** repository named `paperflow`.
2. Upload the contents of this project to the repository root, including `src`, `index.html`, `package.json`, `vite.config.ts`, and `.github/workflows/deploy.yml`.
3. Commit the files to the `main` branch.
4. Open repository Settings → Pages.
5. Under Build and deployment, set Source to **GitHub Actions**.
6. Open Actions and watch the `Deploy Paperflow to GitHub Pages` workflow.
7. When the workflow succeeds, visit https://anythingbutnotnpc.github.io/paperflow/.

## Run locally on Windows
Requires Node.js. In VS Code's terminal:
```powershell
npm.cmd install
npm.cmd run dev
```

## Features
- Responsive liquid-glass-inspired interface with soft ambient gradients and geometric outlines.
- Working image-to-PDF in the browser for JPG, PNG, and WebP images.
- Images can be reordered or removed before conversion.
- Other tool cards are prototypes and explicitly marked as coming soon.
- The image-to-PDF operation processes files locally in the browser; it does not upload selected images to a Paperflow server.

## Important
If you use a repository name other than `paperflow`, update the `base` value in `vite.config.ts` to `/<YOUR-REPOSITORY-NAME>/` before deployment.
