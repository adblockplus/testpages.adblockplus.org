export default {
  eleventyAllowMissingExtension: true,
  permalink: (data) => `/en/${data.page.filePathStem.replace(/^\//, "")}`,
};
