# Yuxing · Portfolio & Blog

The independent portfolio lives at `/`; the original Material blog lives under `/zh/`.

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
- `docs/assets/portfolio/`: theme CSS, carousel JS, local Figma assets and licensed fonts.
- `docs/zh/`: blog Markdown, images, map and PDF reader resources.
- `scripts/portfolio.py`: MkDocs pre-build hook that renders the templates into `docs/index.html` and `docs/projects/*/index.html`. Edit the source templates/data instead of these generated files.

Desktop content occupies 70% of the viewport; tablet and phone layouts use wider margins and fewer carousel cards. All webfonts and portfolio assets are served locally. Dashboard interaction uses explicitly labeled demonstration data.

The repository's existing GitHub Actions publish using `mkdocs gh-deploy`. Local build/preview does not publish changes.
