import re
import markupsafe


def heading(title):
    id = re.sub('[^a-z0-9]+', '-', title.lower()).strip('-')
    return markupsafe.Markup(
        '<h2 aria-label="test-case-{}" id="{}">{}</h2>'.format(
            id,
            id,
            markupsafe.Markup.escape(title)
        ))
