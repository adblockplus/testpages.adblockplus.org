# Changelog

All notable changes to this project will be documented in this file.

## 2025-01-31

- Added new pages in pages/snippets: array-override, hide-if-canvas-contains, replace-fetch-response, replace-xhr-response
- Updated with new test cases: pages/snippets/hide-if-matches-xpath, pages/snippets/json-override, pages/snippets/json-prune
- Updated with resource path changes: pages/snippets/skip-video, pages/snippets/strip-fetch-query-parameter
- Renamed folder from static/testfiles/strip-fetch-query-parameter/ into static/testfiles/fetch-and-xhr/

## 2024-07-25

- Added a new page in pages/snippets: skip-video.

## 2024-05-20

- Added two new pages in pages/service-worker: worker-itself and worker-subresource.

## 2024-04-15

- Added two new pages in pages/snippets: hide-if-matches-computed-xpath and hide-if-matches-xpath3.

## 2024-03-06

- Added a new page "Sitekey on MV3". The existing Sitekey page was renamed to "Sitekey on MV2".

## 2024-02-07

- Generating the wildcard filter per domain

## 2024-01-29

- Require Node 18

## 2024-01-25

- Add functionality to copy filter text on click event for testcase

## 2023-12-14

- Added test page for Wildcard support 

## 2023-11-23

- Added test pages for `remove` filters

## 2023-10-18

- Removed WebRTC testpages

## 2023-10-17

- Resolved conflicting websocket and websocket exception filters

## 2023-10-16

- `strip-fetch-query-parameter test` fails if a filter blocks a legit element. Previously, it would still show a green box.
- `abp-testcase-subscription.txt` has been updated to include the filter `abptestpages.org##div[id='{{eh-id}}']` instead of `abptestpages.org##div[id='']`. This modification ensures the successful execution of the associated test.

## 2023-10-16

- hide-if-has-and-matches-style test fails if a filter blocks a legit element. Previously, it would still show a green box.

## 2023-10-11

- Added warning image to show if sitekey exception rule fails to apply.

## 2023-07-06

- Removed deployment to testpages.adblockplus.org

## 2023-06-26

- Switched default testpages url to `https://abptestpages.org/`

## 2023-05-23

- Added test page for `simulate-mouse-event` snippet. More info: #145

## 2023-02-09

- Updated the `WebSocket` and `WebSocket Exception` pages to use a self hosted
websocket endpoint. More info: #48

## 2023-01-03

- On the test run, changed the `checkLastError()` default behavior to log a
warning instead of throwing an error. That can be changed with the new
`THROW_LAST_ERROR` parameter. More info: #141

## 2022-12-12

- Removed the `testpages-snippets.txt` filter list. More info: #137

## 2022-11-21

- Added test pages for `json-override` and `hide-if-contains-similar-text`
snippets. More info: #134

## 2022-11-09

- Added a comma test case to the `Header` page. More info: #65

## 2022-11-07

- Removed the unused staging list at `/en/staging`
- Removed the unused `Document exception - about:blank` page.

## 2022-11-03

- Simplified the `iFrame` test case on the `Elem Hide` page, removing elements
that already get tested on the `Basic usage` test case.

## 2022-10-26

- Fixed an issue with the CSP Specific page, where the `frame-src` filter
had no effect. More info: #115

## 2022-10-20

- Fixed an issue with the Popup automated test. More info: #131

## 2022-10-13

- Removed the deprecated `BROWSER`, `TESTS_SUBSET` and `TESTS_EXCLUDE`
parameters from the test Docker image.

## 2022-10-04

- Added `=content-type` to header exception filter. More info: #100

## 2022-10-03

- Updated one of the `iFrame Exception` filters, from
`##[alt="Test image placeholder"]` to
`##[alt="iframe-content-rewritten-by-script-placeholder"]`. More info: #125

## 2022-09-29

- Renamed the title of pages/exceptions/iframe_subdomains.tmpl from `iFrame
Exception` to `iFrame Subdomains Exception`, and removed the `<iframe>` ids
on the static html files loaded by that page.

## 2022-09-27

- Added the `GREP` parameter to the test Docker image, and deprecated the
`BROWSER`, `TESTS_SUBSET` and `TESTS_EXCLUDE` parameters.

## 2022-09-20

- Fixed a bug on the Sitekey page that would make the test pass when using an
invalid sitekey filter.

## 2022-09-08

- Moved iframe exception testpage from iframe to iframe_subdomains path.
- Added new iframe exception testpage which does not load iframes across subdomains.
- Add test for iframe subdomain exception via filter that combines $document and $subdocument options

## 2022-09-06

- Add tests for blocking and allowing resources with 4-component domains via filters with 3-component domains.

## 2022-08-18

- Refactor extension tests.

## 2022-08-11

- Add iframe exception testpage to index page.

## 2022-01-21

- Require Node 16.

## 2021-12-21

- Add elemhide-child exception test case.

## 2021-12-20

- Remove `dir-string` snippet testpage.

## 2021-06-14

- Add staging test case list at `/en/staging`.
- Add document exception - about:blank test case.

## 2021-05-25

- Add ID attributes to all test case elements.
- No existing ID attributes were changed.

## 2021-05-13

- Add missing rewrite examples.

## 2021-03-12

- Added XPath test page

## 2021-02-24

- Added subpage containing only Testpages supported by DP ABP integrations (ABP Chromium and ABP Webview). Subpage is available under link: https://testpages.adblockplus.org/en/dp

## 2021-02-08

- Deployed new testpages top-level domain: https://abptestpages.org

## 2020-12-14

- Added subpage containing only Testpages supported by ABPKit. Subpage is available under link: https://testpages.adblockplus.org/en/abpkit

## 2020-10-06

- Added anchor ID's to test cases for linking

## 2020-10-01

- Removed Object and Object Exception test pages. More info [here](https://gitlab.com/eyeo/developer-experience/testpages.adblockplus.org/-/issues/55)

## 2020-07-28

- Added ::content test case for hide-if-contains-visible-text snippet.

## 2020-07-24

- Added Constraints (Domain) test page

## 2020-07-24

- Added hide-if-labelled-by test page

## 2020-07-06

- Removed readd test page (that snippet has been removed from ABP)

## 2020-06-11

- New test pages: Rewrite, Resource type (Other)

## 2020-05-29

- New test elements: `[data-expectedresult="pass"]`, `[data-expectedresult="fail"]`, `.testcase-expected-view`, `.testcase-nostyle`
- Removed elements: `[data-expectedresult="notblocked"]`, `[data-expectedresult="blocked"]`, `.blocked`, `.testcase-good-element`, `.testcase-bad-element`, `testcase-output-expected`
- Testcase areas: replaced `<div class="testcase-container">` with `<div class="testcase-area">` in Ping and Popup test pages.
- Removed `<h3>` from test links in index page.

## 2020-05-22

### Index page update

- New structure: Blocking and Hiding, Filter Options - Resource Types, Filter Options - Resource Type Exceptions, Filter Options - Constraints, Filter Options - Exceptions, Filter Options - Content Security Policy, Snippets, Circumvention
- Static test files: all moved from `/static/testcasefiles` to `/static/testfiles`. Some particular test case files may also change their names and extensions.
- Filters: in `<li><pre>` tags instead of just `<pre>`.
- Example content: replaced `<div class="testcase-content ...">` with `<div class="testcase-examplecontent">`.
- Testcase areas: replaced `<div class="testcase-container">` with `<div class="testcase-area">`, except for Ping and Popup test pages.

## 2020-05-19

### Site key page update

- Enable Site Key page and test on docker
- Update page to the general changes above

## 2020-04-28

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

## 2020-04-27

### Added

- This `CHANGELOG.md` file.
- Project info added to the head section of [test pages](https://testpages.adblockplus.org/) index linking to `CHANGELOG.md`

## 2020-04-24

### Changed

- Simplified internal template inclusions.
- Removed unused site-breadcrumbs and testcases.tmpl page
