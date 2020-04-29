# Changelog

All notable changes to this project will be documented in this file.

## Upcoming

### General changes to pages updated to the new format

- Static test files: move from `/static/testcasefiles` to `/static/testfiles`. Some particular test case files may also change their names and extensions.
- Filters: in `<li><pre>` tags instead of just `<pre>`.
- Test elements: new `.testcase-good-element`, `.testcase-bad-element` and `.testcase-waitingcontent` classes.
- Testcase panels: replace `<section class="site-panel">` with `<section class="testcase-panel">`.
- Testcase areas: replace `<div class="testcase-container">` with `<div class="testcase-area">`. That needs changes to `adblockpluschrome`, they will coexist for now.
- Blocked elements: replace `class="blocked"` with `data-expectedresult="blocked"`. Currently coexisting.
- Example content: replace `<div class="testcase-content ...">` with `<div class="testcase-examplecontent">`.
- Other CSS changes: Please check comments in [testpages.css](https://gitlab.com/eyeo/adblockplus/testpages.adblockplus.org/-/tree/master/static/css).

### Site key page update

- Enable Site Key page and test on docker
- Update page to the general changes above

## [2020-04-28]

### Circumvention pages update

- Removes unused CSS classes based on General changes above

### Constraints and Exceptions pages update

Deleted static files:
- `static/testcasefiles/document/image.jpg`
- `static/testcasefiles/document/stylesheet.css`
- `static/testcasefiles/document/stylesheet.css`
- `static/testcasefiles/elemhide/image.jpg`
- `static/testcasefiles/genericblock/frame.html`
- `static/testcasefiles/genericblock/target-generic.jpg`
- `static/testcasefiles/genericblock/target-notgeneric.jpg`
- `static/testcasefiles/generichide/frame.html`
- `static/testcasefiles/matchcase/1/abc.jpg`
- `static/testcasefiles/matchcase/2/ABC.jpg`

Added static files:
- `static/testfiles/document/image.png`
- `static/testfiles/elemhide/image.png`
- `static/testfiles/genericblock/generic.png`
- `static/testfiles/genericblock/specific.png`
- `static/testfiles/match-case/dynamic/1/abc.png`
- `static/testfiles/match-case/dynamic/2/ABC.png`
- `static/testfiles/match-case/static/1/abc.png`
- `static/testfiles/match-case/static/2/ABC.png`

## [2020-04-27]

### Added

- This `CHANGELOG.md` file.
- Project info added to the head section of [test pages](https://testpages.adblockplus.org/) index linking to `CHANGELOG.md`

## [2020-04-24]

### Changed

- Simplified internal template inclusions.
- Removed unused site-breadcrumbs and testcases.tmpl page

[2020-04-28]: https://gitlab.com/eyeo/adblockplus/testpages.adblockplus.org/compare/0c3e3b2...b41de37
[2020-04-27]: https://gitlab.com/eyeo/adblockplus/testpages.adblockplus.org/compare/5498946...0c3e3b2
[2020-04-24]: https://gitlab.com/eyeo/adblockplus/testpages.adblockplus.org/compare/497eb09...5498946
