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
import {checkLastError, runWithHandle,
        executeScriptCompliant} from "../../misc/utils.js";
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
  let error = await runWithHandle(driver, extensionHandle,
                                  () => executeScriptCompliant(driver, `
    let filters = arguments[0];
    let subs = await browser.runtime.sendMessage(
      {type: "subscriptions.get"}
    );
    await Promise.all(subs.map(subscription => browser.runtime.sendMessage(
      {type: "subscriptions.remove", url: subscription.url}
    )));
    let filtersToRemove = await browser.runtime.sendMessage(
      {type: "filters.get"}
    );
    await Promise.all(filtersToRemove.map(filter => browser.runtime.sendMessage(
      {type: "filters.remove", text: filter.text}
    )));
    let errors = await browser.runtime.sendMessage(
      {type: "filters.importRaw", text: filters}
    );
    return errors[0];`, filters)
  );
  if (error)
    throw error;

  await driver.navigate().refresh();
}

export default () => {
  describe("Test pages", function() {
    it("discovered test cases", function() {
      assert.ok(this.test.parent.parent.pageTests.length > 0);
    });

    for (let [section, testCases] of this.parent.pageTests) {
      describe(section, () => {
        for (let [url, pageTitle] of testCases) {
          it(pageTitle, async function() {
            let page = getPage(url);
            if (isExcluded(page, this.browserName, this.browserVersion))
              this.skip();

            if (page in specializedTests) {
              await updateFilters(this.driver, this.extensionHandle, url);
              let locator = By.className("testcase-area");
              for (let element of await this.driver.findElements(locator))
                await specializedTests[page].run(element, this.extensionHandle);
            }
            else {
              let expectedScreenshot = await getExpectedScreenshot(this.driver,
                                                                   url);
              await updateFilters(this.driver, this.extensionHandle, url);
              await runGenericTests(this.driver, expectedScreenshot,
                                    this.browserName, this.browserVersion,
                                    pageTitle, url);
            }

            await checkLastError(this.driver, this.extensionHandle);
          });
        }
      });
    }

    describe("Subscriptions", () => {
      defineSubscribeTest();
    });
  });
};
