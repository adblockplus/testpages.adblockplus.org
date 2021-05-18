import re
from jinja2.utils import Markup, escape


def heading(title):
    id = re.sub('[^a-z0-9]+', '-', title.lower()).strip('-')
    return Markup('<h2 aria-label="test-case-{}" id="{}">{}</h2>'.format(
        id,
        id,
        escape(title)
    ))
