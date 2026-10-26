"""Check the portfolio/blog routing contract after `mkdocs build`."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
ORIGIN = 'https://thingamab0b.github.io'


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.refs = []
        self.ids = set()
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for attribute in ('href', 'src', 'data-pdf'):
            if attrs.get(attribute):
                self.refs.append(attrs[attribute])


def target_for(path):
    target = SITE / unquote(path).lstrip('/')
    return target / 'index.html' if target.is_dir() else target


pages = ['/', '/projects/sleep-pod/', '/projects/sleep-pod/experience/', '/projects/landing-page/', '/projects/marketing-dashboard/', '/zh/',
         '/zh/en/', '/zh/blog/', '/zh/me/footprint/', '/zh/tech/thesis/']
checked = 0
for path in pages:
    file = target_for(path)
    assert file.is_file(), f'Missing page: {path}'
    page = Page(file.read_text())
    for ref in page.refs:
        url = urlsplit(urljoin(ORIGIN + path, ref))
        if url.netloc != 'thingamab0b.github.io' or url.scheme not in ('https', 'http'):
            continue
        target = target_for(url.path)
        assert target.is_file(), f'{path}: missing {ref}'
        if url.fragment and target.suffix == '.html':
            assert unquote(url.fragment) in Page(target.read_text()).ids, f'{path}: missing anchor {ref}'
        checked += 1

redirects = {'/cv/': '/', '/cv/sleep-pod/': '/projects/sleep-pod/',
             '/cv/landing-page/': '/projects/landing-page/',
             '/zh/me/resume/': '/', '/en/': '/zh/en/', '/blog/': '/zh/blog/',
             '/mkdocs/html/': '/zh/mkdocs/html/'}
for old, new in redirects.items():
    html = target_for(old).read_text()
    assert f'content="0;url={new}"' in html, old
    assert target_for(new).is_file(), new

css = SITE / 'assets/portfolio/portfolio.css'
for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text()):
    assert (css.parent / ref).is_file(), f'Missing CSS asset: {ref}'

assert all(p.relative_to(ROOT / 'docs').parts[0] == 'zh'
           for p in (ROOT / 'docs').rglob('*.md')), 'Blog source escaped /zh/'
blog_pages = [p for p in SITE.rglob('*.html')
              if not any(part.startswith('.') for part in p.relative_to(SITE).parts)
              and 'class="md-header' in p.read_text()]
assert all(p.relative_to(SITE).parts[0] == 'zh' for p in blog_pages), 'Blog theme escaped /zh/'
index = json.loads((SITE / 'search/search_index.json').read_text())
assert all(d['location'].startswith('zh/') for d in index['docs']), 'Blog search escaped /zh/'
assert 'figma.com/api' not in (SITE / 'index.html').read_text(), 'Temporary asset URL remains'
print(f'PASS: {len(pages)} entry pages, {checked} local references, {len(redirects)} redirects, '
      f'{len(blog_pages)} blog pages, CSS assets and search index.')
