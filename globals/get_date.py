from datetime import datetime
from jinja2 import pass_context


@pass_context
def get_date(context):
    return datetime.today().strftime('%d %B %Y')
