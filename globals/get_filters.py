from html.parser import HTMLParser

from jinja2 import contextfunction


class FilterHTMLParser(HTMLParser):
  def __init__(self):
    HTMLParser.__init__(self)
    self.in_site_panel = False
    self.in_filter_pre = False
    self.filters = []

  def handle_starttag(self, tag, attrs):
    if tag == "section" and dict(attrs).get("class") == "site-panel":
      self.in_site_panel = True
    elif tag == "ul" and dict(attrs).get("class") == "testcase-filters":
      self.in_site_panel = True
    elif self.in_site_panel and tag == "pre":
      self.in_filter_pre = True

  def handle_endtag(self, tag):
    if self.in_filter_pre and tag == "pre":
      self.in_filter_pre = False
    elif self.in_site_panel and tag == "section":
      self.in_site_panel = False
    elif self.in_site_panel and tag == "ul":
      self.in_site_panel = False

  def handle_data(self, data):
    if self.in_site_panel and self.in_filter_pre:
      self.filters.append(data)


@contextfunction
def get_filters(context, specific_pages=[]):
  filters = []
  for page, format in context["source"].list_pages():
    if specific_pages and page not in specific_pages:
      continue

    parser = FilterHTMLParser()
    parser.feed(context["source"].read_page(page, format)[0])
    if parser.filters and not any("csp" in s for s in parser.filters):
      filters += ["", "! " + page] + parser.filters

  return context.environment.from_string("\n".join(filters)).render(context)
