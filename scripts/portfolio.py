"""Render the editable portfolio sources before MkDocs collects its static files."""
import json
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup, escape

ROOT = Path(__file__).resolve().parents[1]

def write_if_changed(path, content):
    # MkDocs watches docs/: rewriting identical output would cause a rebuild loop.
    if not path.exists() or path.read_text() != content:
        path.write_text(content)

def render():
    env = Environment(loader=FileSystemLoader(ROOT / 'portfolio/templates'), autoescape=select_autoescape(['html']))
    env.filters['linebreaks'] = lambda text: Markup('<br>').join(escape(text).split('\n'))
    docs = ROOT / 'docs'
    home = json.loads((ROOT / 'portfolio/home.json').read_text())
    result = env.get_template('home.html').render(**home, home=True, path='/', title='杨煜行 Yuxing｜Product & Marketing', description='清华工科背景，智能硬件产品经理。产品定义与交付、海外 GTM、页面设计及增长迭代。')
    write_if_changed(docs / 'index.html', result)
    projects = json.loads((ROOT / 'portfolio/projects.json').read_text())
    stages = json.loads((ROOT / 'portfolio/sleepal-experience.json').read_text())
    anchors = {'sleep-pod':['pod-flow','pod-ui','pod-delivery'], 'landing-page':['landing-design','landing-build','landing-conversion']}
    for project in projects:
        for section, anchor in zip(project['sections'], anchors.get(project['slug'], [])):
            section['anchor'] = anchor
        target = docs / 'projects' / project['slug'] / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        template = {'sleep-pod': 'sleep-pod.html', 'landing-page': 'sleepal-dtc.html', 'marketing-dashboard': 'sleepal-dashboard.html'}.get(project['slug'], 'project.html')
        write_if_changed(target, env.get_template(template).render(stages=stages, mediaRoot='/assets/portfolio/projects/sleep-pod/experience/', project=project, home=False, path=f"/projects/{project['slug']}/", title=f"{project['key']}｜Yuxing", description=project['brief']))
    stages = json.loads((ROOT / 'portfolio/sleepal-experience.json').read_text())
    experience = docs / 'projects/sleep-pod/experience/index.html'
    experience.parent.mkdir(parents=True, exist_ok=True)
    write_if_changed(experience, env.get_template('sleepal-experience.html').render(stages=stages, mediaRoot='/assets/portfolio/projects/sleep-pod/experience/'))

def on_pre_build(config):
    render()

def on_serve(server, config, builder):
    server.watch(str(ROOT / 'portfolio'), builder)
    return server

if __name__ == '__main__':
    render()
