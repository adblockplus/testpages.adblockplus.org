from datetime import datetime
from jinja2 import contextfunction


@contextfunction
def get_date(context):
    return datetime.today().strftime('%d %B %Y')
