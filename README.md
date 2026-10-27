# Yuxing · Portfolio & Blog

The independent portfolio lives at `/`; the original Material blog lives under `/zh/`.

The portfolio defaults to English. The navigation’s **中文 / EN** link switches to the same page and section in the other language, remembering explicit choices in local storage. Chinese portfolio pages live under `/cn/`; the existing `/zh/` blog and its articles are unchanged. Both portfolio languages are generated as static HTML and work without JavaScript.

| Page | Route |
| --- | --- |
| Portfolio | `/` |
| Sleepal sleep pod case study | `/projects/sleep-pod/` |
| Sleepal landing page case study | `/projects/landing-page/` |
| Sleepal marketing dashboard case study | `/projects/marketing-dashboard/` |
| Blog | `/zh/` |
| English blog introduction | `/zh/en/` |

Previous `/cv/`, `/cv/sleep-pod/`, `/cv/landing-page/`, `/zh/me/resume/`, `/en/` and `/blog/` URLs redirect to their new locations. Existing `/zh/` article URLs are unchanged.

## Local preview

Install `mkdocs-material` in your Python environment, then run:

```sh
mkdocs build
python scripts/check_site.py
python -m http.server 8000 --bind 127.0.0.1 --directory site
```

Open `http://127.0.0.1:8000/`. Rebuild after edits and refresh the browser. Alternatively, `mkdocs serve -a 127.0.0.1:8000` provides a development server that watches the portfolio templates and JSON as well as the blog sources.

## Editing

- Figma source: [Blog design](https://www.figma.com/design/UWPT0D9RlCciIMhml8rVyk/Blog). Home `1:9`, sleep pod `1:200`, landing page `1:419`.
- `portfolio/templates/`: shared navigation/footer, home and continuous project layouts.
- `portfolio/home.json`, `portfolio/projects.json`: portfolio copy and project content.
- `portfolio/locales/en.json`: English translations keyed by the original Chinese copy. The renderer reports missing translations during the build; update this catalog when changing Chinese text. Original project screenshots and videos retain their recorded content.
- `docs/assets/portfolio/`: theme CSS, carousel JS, local Figma assets and licensed fonts.
- `docs/zh/`: blog Markdown, images, map and PDF reader resources.
- `scripts/portfolio.py`: MkDocs pre-build hook that renders the templates into `docs/index.html` and `docs/projects/*/index.html`. Edit the source templates/data instead of these generated files.
- `scripts/portfolio_locale.py`: localizes rendered text, accessibility labels and embedded experience data, and resolves Chinese portfolio links. Interactive control text is localized in the corresponding JavaScript files using `portfolioText`.

Desktop content occupies 70% of the viewport; tablet and phone layouts use wider margins and fewer carousel cards. All webfonts and portfolio assets are served locally. Dashboard interaction uses explicitly labeled demonstration data.

The homepage uses native scrolling with subtle hero parallax on desktop and one-time reveals for experience and skills. Parallax is disabled below 768px; all decorative motion respects `prefers-reduced-motion`.

The repository's existing GitHub Actions publish using `mkdocs gh-deploy`. Local build/preview does not publish changes.
