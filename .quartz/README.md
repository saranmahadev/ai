# AI Knowledge Brain Site

This hidden folder builds the surrounding Obsidian vault as a Quartz static site. It does not copy, move, or alter the Markdown notes.

## Local preview

```powershell
Set-Location .quartz
npm install
npm run preview
```

Open `http://localhost:8080`. Stop the preview with `Ctrl+C`.

## Production build

```powershell
Set-Location .quartz
npm run build:site
```

The generated site is written to `.quartz/public/` and is ignored by Git.

## Deployment

The GitHub Actions workflow at `../.github/workflows/deploy-site.yml` deploys the site to GitHub Pages on pushes to `main`. Enable **Settings > Pages > Source: GitHub Actions** in the GitHub repository.

Set `configuration.baseUrl` in `quartz.config.default.yaml` after you know the final site address; it is used for the sitemap and RSS feed.

Built with [Quartz](https://quartz.jzhao.xyz/).
