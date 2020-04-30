from jinja2 import contextfunction
from datetime import datetime

@contextfunction
def get_date(context):
    return datetime.today().strftime('%d %B %Y')
