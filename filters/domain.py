import urlparse

def domain(url):
  return urlparse.urlsplit(url).netloc.split(":")[0]
