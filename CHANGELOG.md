# Changelog

All notable changes to this project will be documented in this file.

## 2021-12-xx

- Add elemhide- child exception test case.

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

- Removed Object and Object Exception test pages. More info [here](https://gitlab.com/eyeo/adblockplus/testpages.adblockplus.org/-/issues/55)

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
