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

import path from "path";
import url from "url";
import got from "got";

import {BROWSERS} from "@eyeo/get-browser-binary";

import {writeScreenshotAndThrow} from "./misc/screenshots.js";
import definePageTests from "./pages/index.js";

// Required to set the driver path on Windows
import "msedgedriver";

const TEST_PAGES_URL = process.env.TEST_PAGES_URL ||
                       "https://testpages.adblockplus.org/en/";
const TEST_PAGES_INSECURE = process.env.TEST_PAGES_INSECURE == "true";
const BROWSER_VERSIONS = {
  chromium: [void 0, "beta", "dev", "77.0.3865.0"],
  firefox: [void 0, "beta", "68.0"],
  edge: [void 0]
};

let extensionPaths = [
  path.resolve("./testext"),
  path.resolve("test", "extension-tests", "helper-extension")
];

async function getExtensionName(driver, handles) {
  let handle;
  let extensionName;

  for (handle of handles) {
    await driver.switchTo().window(handle);
    extensionName = await driver.executeAsyncScript(async(...args) => {
      let callback = args[args.length - 1];
      if (typeof browser != "undefined") {
        let info = await browser.management.getSelf();
        if (info.optionsUrl == location.href)
          callback(info.name);
      }
      callback();
    });
    if (extensionName)
      break;
  }

  return extensionName ? extensionName : "";
}

function hasABPStarted(driver, handles) {
  // Temporary, until: https://gitlab.com/adblockinc/ext/adblockplus/adblockplusui/-/issues/1222
  return driver.wait(async() => {
    for (let handle of handles) {
      await driver.switchTo().window(handle);
      let currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes("first-run.html") ||
        currentUrl.includes("welcome.adblockplus.org"))
        return true;
    }
    return false;
  }, 10000, "Welcome page is not shown for ABP");
}

async function waitForExtension(driver) {
  let handles = [];

  await new Promise(r => setTimeout(r, 5000)); // helper extension timeout
  await driver.wait(async() => {
    let seenHandles = handles;
    handles = await driver.getAllWindowHandles();
    return handles.every(handle => seenHandles.includes(handle));
  }, 10000, "Handles kept changing after timeout", 3000);
  let origin;
  let handle;
  let started = true;
  let extensionName = await getExtensionName(driver, handles);
  if (extensionName.includes("Adblock Plus"))
    started = await hasABPStarted(driver, handles);

  for (handle of handles) {
    await driver.switchTo().window(handle);
    origin = await driver.executeAsyncScript(async(...args) => {
      let callback = args[args.length - 1];
      if (typeof browser != "undefined") {
        let info = await browser.management.getSelf();
        if (info.optionsUrl == location.href)
          callback(location.origin);
      }
      callback();
    });
    if (origin && started)
      break;
  }

  if (!origin)
    throw new Error("Extension didn't start correctly, options is not shown");

  return [handle, origin];
}

async function getPageTests() {
  let options = TEST_PAGES_INSECURE ? {rejectUnauthorized: false} : {};
  let response;

  try {
    response = await got(TEST_PAGES_URL, options);
  }
  catch (e) {
    console.warn(`Warning: Test pages not parsed at "${TEST_PAGES_URL}"\n${e}`);
    return [];
  }

  let regexpSection = /<h3>(.*?)<\/h3>([\s\S]*?)<\/ul>/gm;
  let matchSection;
  let tests = [];
  while (matchSection = regexpSection.exec(response.body)) {
    let regexpTests = /"test-link" href="(.*?)"[\S\s]*?>(.*?)</gm;
    let testCases = [];
    let match;
    while (match = regexpTests.exec(matchSection[2]))
      testCases.push([url.resolve(TEST_PAGES_URL, match[1]), match[2]]);

    tests.push([matchSection[1], testCases]);
  }

  return tests;
}

if (typeof run == "undefined") {
  console.error("--delay option required");
  process.exit(1);
}

(async() => {
  let pageTests = await getPageTests();

  for (let browser of Object.keys(BROWSERS)) {
    for (let version of BROWSER_VERSIONS[browser]) {
      describe(`Browser: ${browser} ${version || "latest"}`, function() {
        this.timeout(0);
        this.pageTests = pageTests;
        this.testPagesURL = TEST_PAGES_URL;

        before(async function() {
          let headless = browser == "firefox";
          // eslint-disable-next-line no-console
          console.log(`Getting ready to run ${browser}...`);
          this.driver = await BROWSERS[browser].getDriver(
            version,
            {headless, extensionPaths, incognito: false, insecure: true}
          );
          let cap = await this.driver.getCapabilities();
          this.browserName = cap.getBrowserName();
          this.browserVersion = cap.getBrowserVersion();
          // eslint-disable-next-line no-console
          console.log(`Browser: ${this.browserName} ${this.browserVersion}`);

          try {
            // Wait for extension to finish installation
            await this.driver.sleep(2000);
            [this.extensionHandle, this.extensionOrigin] =
              await waitForExtension(this.driver);
          }
          catch (e) {
            await writeScreenshotAndThrow(this, e);
          }
        });

        beforeEach(async function() {
          let handles = await this.driver.getAllWindowHandles();
          let defaultHandle =
            handles.find(handle => handle != this.extensionHandle);

          for (let handle of handles) {
            if (handle != this.extensionHandle && handle != defaultHandle) {
              try {
                await this.driver.switchTo().window(handle);
                await this.driver.close();
              }
              catch (e) {}
            }
          }

          await this.driver.switchTo().window(defaultHandle);
        });

        definePageTests();

        after(async function() {
          if (this.driver)
            await this.driver.quit();
        });
      });
    }
  }
  run();
})();
