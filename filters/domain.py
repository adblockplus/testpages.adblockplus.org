from urllib import parse

def domain(url):
  return parse.urlsplit(url).netloc.split(":")[0]
