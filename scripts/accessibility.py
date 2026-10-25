"""Structural and palette checks; not a claim of complete WCAG conformance."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.labels=set(); self.fields=[]; self.refs=[]; self.stack=[]; self.errors=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='label' and a.get('for'): self.labels.add(a['for'])
        if tag in ('input','select','textarea'):
            self.fields.append((tag,a,'label' in self.stack))
        for key in ('aria-labelledby','aria-describedby'):
            self.refs.extend(a.get(key,'').split())
        if tag=='img' and 'alt' not in a:self.errors.append('Image without alternative text')
        if tag=='form' and 'novalidate' not in a:self.errors.append('Form has no owned validation declaration')
        if tag=='svg' and a.get('role')=='img' and not a.get('aria-labelledby'):self.errors.append('Diagram has no accessible title')
        if tag not in ('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'):self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag in self.stack:
            i=len(self.stack)-1-self.stack[::-1].index(tag);self.stack=self.stack[:i]
    def check(self):
        for tag,a,wrapped in self.fields:
            if not (wrapped or a.get('id') in self.labels or a.get('aria-label') or a.get('aria-labelledby')):self.errors.append(f'Unlabeled {tag}')
        for ref in self.refs:
            if ref not in self.ids:self.errors.append(f'Missing ARIA target {ref}')
        return self.errors

def luminance(h):
    vals=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    r,g,b=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in vals]
    return .2126*r+.7152*g+.0722*b
def ratio(a,b):
    a,b=sorted([luminance(a),luminance(b)]);return (b+.05)/(a+.05)

def main():
    files=[ROOT/'index.html',ROOT/'404.html']
    for directory in ('about','apply','approaches','cases','compare','explore','learn','practice','saved'):
        files.extend((ROOT/directory).rglob('*.html'))
    for p in files:
        page=Page();page.feed(p.read_text());assert not page.check(),(str(p.relative_to(ROOT)),page.errors)
    css=(ROOT/'assets/style.css').read_text()
    light=re.search(r':root\{([^}]+)',css)[1]
    dark=re.search(r'\[data-theme=dark\]\{([^}]+)',css)[1]
    for mode,block in [('light',light),('dark',dark)]:
        tokens=dict(re.findall(r'--([\w-]+):(#[\da-fA-F]{6})',block))
        for fg,bg in [('text','bg'),('body','bg'),('muted','bg'),('accent','bg'),('blue','blue-bg'),('red','red-bg'),('green','green-bg')]:
            assert ratio(tokens[fg],tokens[bg])>=4.5,(mode,fg,bg,ratio(tokens[fg],tokens[bg]))
    print(f'Structural labels, ARIA references, diagram names, and forms checked on {len(files)} pages; seven text pairs pass 4.5:1 in each theme.')
    print('Full screen-reader, cross-browser, and reader-task validation remain separate checks.')

if __name__=='__main__':main()
