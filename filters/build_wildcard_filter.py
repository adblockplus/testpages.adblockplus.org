import urllib.parse


def build_wildcard_filter(domain):
    if domain == "localhost":
        return "abptestpages.*"
  
    subdomains = domain.split(".")
    return subdomains[-2] + ".*"
