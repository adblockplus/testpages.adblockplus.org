import re

from jinja2.utils import Markup, escape

def heading(title):
    return Markup('<h2 id="{}">{}</h2>'.format(
        re.sub('[^a-z0-9]+', '-', title.lower()).strip('-'),
        escape(title)
    ))
