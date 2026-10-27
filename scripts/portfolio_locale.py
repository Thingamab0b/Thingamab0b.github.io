"""Localize rendered portfolio HTML without duplicating its layout templates."""
import json
import re
from html import escape
from html.parser import HTMLParser

CJK = re.compile(r'[\u3400-\u9fff]')


class PortfolioLocale(HTMLParser):
    def __init__(self, language, catalog):
        super().__init__(convert_charrefs=True)
        self.language = language
        self.catalog = catalog
        self.output = []
        self.script_type = None
        self.in_script = False

    def translate(self, value):
        if self.language != 'en' or not isinstance(value, str):
            return value
        key = value.strip()
        if key in self.catalog:
            return value.replace(key, self.catalog[key], 1)
        if CJK.search(key) and key != '中文':
            raise ValueError(f'Missing English portfolio translation: {key}')
        return value

    def translate_data(self, value):
        if isinstance(value, dict):
            return {k: self.translate_data(v) for k, v in value.items()}
        if isinstance(value, list):
            return [self.translate_data(v) for v in value]
        return self.translate(value)

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
            self.script_type = dict(attrs).get('type')
        result = []
        for name, value in attrs:
            if name in ('alt', 'title', 'aria-label', 'aria-description', 'placeholder', 'content') and value:
                value = self.translate(value)
            if name == 'href' and value and self.language == 'zh':
                if value == '/' or value.startswith('/#') or value.startswith('/projects/'):
                    # The explicit language link always points to the other locale.
                    if dict(attrs).get('data-language') != 'en':
                        value = '/cn' + value
            result.append(name if value is None else f'{name}="{escape(value, quote=True)}"')
        self.output.append('<' + tag + (' ' + ' '.join(result) if result else '') + '>')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.output[-1] = self.output[-1][:-1] + '/>'

    def handle_endtag(self, tag):
        self.output.append(f'</{tag}>')
        if tag == 'script':
            self.in_script = False
            self.script_type = None

    def handle_data(self, data):
        if self.in_script:
            if self.script_type == 'application/json':
                data = json.dumps(self.translate_data(json.loads(data)), ensure_ascii=True).replace('<', '\\u003c')
            self.output.append(data)
        else:
            self.output.append(escape(self.translate(data), quote=False))

    def handle_decl(self, decl):
        self.output.append(f'<!{decl}>')

    def handle_comment(self, comment):
        self.output.append(f'<!--{comment}-->')


def localize(source, language, catalog):
    parser = PortfolioLocale(language, catalog)
    parser.feed(source)
    parser.close()
    return ''.join(parser.output)
