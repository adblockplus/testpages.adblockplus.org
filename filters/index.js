export function domain(url) {
  return new URL(url).hostname;
}

export function strip_proto(url) {
  const separator = url.indexOf("://");
  return separator === -1 ? url : url.slice(separator + 3);
}

export function build_wildcard_filter(domain) {
  // local.abptestpages.org resolves to localhost for the wildcard test.
  if (domain === "localhost") {
    return "abptestpages.*";
  }
  return domain.split(".").at(-2) + ".*";
}
