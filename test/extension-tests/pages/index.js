/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

import assert from "assert";
import webdriver from "selenium-webdriver";
import {checkLastError, runWithHandle} from "../misc/utils.js";
import specializedTests from "./specialized.js";
import defineSubscribeTest from "./subscribe.js";
import {getExpectedScreenshot, getPage, isExcluded, runGenericTests}
  from "./utils.js";

const {By} = webdriver;

async function getFilters(driver) {
  let filters = new Set();
  for (let element of await driver.findElements(By.css("pre"))) {
    for (let line of (await element.getText()).split("\n"))
      filters.add(line);
  }
  return Array.from(filters).join("\n");
}

async function updateFilters(driver, extensionHandle, url) {
  await driver.navigate().to(url);
  let filters = await getFilters(driver);
  let error = null;
  error = await runWithHandle(
    driver, extensionHandle, () =>
      driver.executeAsyncScript(async(...args) => {
        let errors = null;
        let callback = args[args.length - 1];
        let filtersToAdd = args[0];

        if (typeof browser != "undefined") { // Firefox
          errors = await browser.runtime.sendMessage(
            {type: "filters.importRaw", text: filtersToAdd}
          );
          if (typeof errors != "undefined")
            errors = errors[0];
        }
        else if (typeof chrome != "undefined") { // Chromium
          errors = await new Promise(resolve => chrome.runtime.sendMessage(
            {type: "filters.importRaw", text: filtersToAdd},
            errorsInResponse => resolve(errorsInResponse[0])
          ));
        }

        // ABP changed the return of filters.importRaw to [errors, filterTexts]
        // https://gitlab.com/adblockinc/ext/adblockplus/adblockplus/-/merge_requests/1064
        if (typeof errors != "undefined" &&
          errors[0] && errors[0].constructor === Array)
          errors = errors[0];

        if (typeof errors != "undefined")
          callback(errors[0]);
        else
          callback();
      }, filters)
  );
  if (error)
    throw error;
  await driver.navigate().refresh();
}

function removeFilters(driver, extensionHandle) {
  return runWithHandle(driver, extensionHandle, () => driver.executeAsyncScript(
    async(...args) => {
      let callback = args[args.length - 1];
      // Firefox
      if (typeof browser !== "undefined") {
        let filters = await browser.runtime.sendMessage({type: "filters.get"});
        await Promise.all(filters.map(filter => browser.runtime.sendMessage(
          {type: "filters.remove", text: filter.text}
        )));
      }

      // Chromium
      if (typeof chrome != "undefined") {
        let filters = await new Promise(resolve => {
          chrome.runtime.sendMessage({type: "filters.get"}, response => {
            resolve(response);
          });
        });
        await Promise.all(filters.map(filter => new Promise(resolve => {
          chrome.runtime.sendMessage(
            {type: "filters.remove", text: filter.text},
            response => resolve(response)
          );
        })));
      }

      callback();
    }
  ));
}

export default () => {
  describe("Test pages", function() {
    afterEach(async function() {
      await removeFilters(this.driver, this.extensionHandle);
      await checkLastError(this.driver, this.extensionHandle);
    });

    it("discovered test cases", function() {
      assert.ok(this.test.parent.parent.pageTests.length > 0);
    });

    for (let [section, testCases] of this.parent.pageTests) {
      describe(section, () => {
        for (let [url, pageTitle] of testCases) {
          it(pageTitle, async function() {
            let page = getPage(url);
            if (isExcluded(page, this.browserName))
              this.skip();

            if (page in specializedTests) {
              await updateFilters(this.driver, this.extensionHandle, url);
              let locator = By.className("testcase-area");
              for (let element of await this.driver.findElements(locator)) {
                await specializedTests[page].run(this.driver, element,
                                                 this.extensionHandle);
              }
            }
            else {
              let expectedScreenshot = await getExpectedScreenshot(this, url);
              await updateFilters(this.driver, this.extensionHandle, url);
              await runGenericTests(this.driver, expectedScreenshot,
                                    this.browserName, this.browserVersion,
                                    pageTitle, url);
            }
          });
        }
      });
    }

    describe("Subscriptions", defineSubscribeTest);
  });
};
