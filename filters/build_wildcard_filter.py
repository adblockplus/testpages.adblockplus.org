def build_wildcard_filter(domain):
    # If you run it locally the web server is available on localhost:5001,
    # but the wildcard test assumes a domain to be used. To make it happen
    # "local.abptestpages.org" is resolved to localhost with DNS.
    if domain == "localhost":
        return "abptestpages.*"
    subdomains = domain.split(".")
    return subdomains[-2] + ".*"
