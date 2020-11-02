def strip_proto(url):
    return url.split('://', 1)[-1]
