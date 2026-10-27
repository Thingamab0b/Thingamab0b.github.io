"""Render the editable portfolio sources before MkDocs collects its static files."""
import json
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup, escape
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from portfolio_locale import localize

ROOT = Path(__file__).resolve().parents[1]

def write_if_changed(path, content):
    # MkDocs watches docs/: rewriting identical output would cause a rebuild loop.
    content = '\n'.join(line.rstrip() for line in content.splitlines()) + '\n'
    if not path.exists() or path.read_text() != content:
        path.write_text(content)

def render():
    env = Environment(loader=FileSystemLoader(ROOT / 'portfolio/templates'), autoescape=select_autoescape(['html']))
    env.filters['linebreaks'] = lambda text: Markup('<br>\n').join(escape(text).split('\n'))
    docs = ROOT / 'docs'
    catalog = json.loads((ROOT / 'portfolio/locales/en.json').read_text())

    def render_page(template, path, **context):
        for language in ('en', 'zh'):
            localized_path = path if language == 'en' else '/cn' + path
            source = env.get_template(template).render(
                **context, language=language, path=localized_path,
                english_path=path, chinese_path='/cn' + path)
            target = docs / localized_path.lstrip('/') / 'index.html'
            target.parent.mkdir(parents=True, exist_ok=True)
            write_if_changed(target, localize(source, language, catalog))

    home = json.loads((ROOT / 'portfolio/home.json').read_text())
    render_page('home.html', '/', **home, home=True, title='杨煜行 Yuxing｜Product & Marketing', description='清华工科背景，智能硬件产品经理。产品定义与交付、海外 GTM、页面设计及增长迭代。')
    projects = json.loads((ROOT / 'portfolio/projects.json').read_text())
    stages = json.loads((ROOT / 'portfolio/sleepal-experience.json').read_text())
    anchors = {'sleep-pod':['pod-flow','pod-ui','pod-delivery'], 'landing-page':['landing-design','landing-build','landing-conversion']}
    for project in projects:
        for section, anchor in zip(project['sections'], anchors.get(project['slug'], [])):
            section['anchor'] = anchor
        template = {'sleep-pod': 'sleep-pod.html', 'landing-page': 'sleepal-dtc.html', 'marketing-dashboard': 'sleepal-dashboard.html'}.get(project['slug'], 'project.html')
        render_page(template, f"/projects/{project['slug']}/", stages=stages, mediaRoot='/assets/portfolio/projects/sleep-pod/experience/', project=project, home=False, title=f"{project['key']}｜Yuxing", description=project['brief'])
    render_page('sleepal-experience.html', '/projects/sleep-pod/experience/', stages=stages, mediaRoot='/assets/portfolio/projects/sleep-pod/experience/')

def on_pre_build(config):
    render()

def on_serve(server, config, builder):
    server.watch(str(ROOT / 'portfolio'), builder)
    return server

if __name__ == '__main__':
    render()
