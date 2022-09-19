import urllib.parse


def domain(url):
    return urllib.parse.urlsplit(url).netloc.split(':')[0]
