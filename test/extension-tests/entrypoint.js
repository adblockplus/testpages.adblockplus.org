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

/* eslint-disable no-console */

import path from "path";
import url from "url";
import got from "got";

import {BROWSERS} from "@eyeo/get-browser-binary";

import {writeScreenshotAndThrow} from "./misc/screenshots.js";
import definePageTests from "./pages/index.js";

const TEST_PAGES_URL = process.env.TEST_PAGES_URL ||
                       "https://abptestpages.org/";
const TEST_PAGES_INSECURE = process.env.TEST_PAGES_INSECURE == "true";
const CUSTOM_BROWSER = process.env.CUSTOM_BROWSER;
const CUSTOM_BROWSER_VERSION = process.env.BROWSER_VERSION || "latest";

// Timeout in sync with test/extension-tests/helper-extension/background.js
const helperExtTimeout = 10000;

let browserVersions = {
  chromium: ["latest", "beta", "dev", "77.0.3865.0"],
  firefox: ["latest", "beta", "75.0", "68.0"],
  edge: ["latest"]
};

const extensionPaths = [
  path.resolve("./testext"),
  path.resolve("test", "extension-tests", "helper-extension")
];

async function getExtensionInfo(driver, originHandle) {
  await driver.switchTo().window(originHandle);

  let info = await driver.executeAsyncScript(async callback => {
    if (typeof browser !== "undefined") { // Firefox
      let {shortName, version, permissions} =
        await browser.management.getSelf();
      callback({name: shortName, version, permissions});
    }
    else { // Chromium
      new Promise(resolve => {
        chrome.management.getSelf(({shortName, version, permissions}) =>
          resolve({name: shortName, version, permissions}));
      }).then(callback);
    }
  });
  info.manifestVersion = 2;
  if (info.permissions.includes("declarativeNetRequest") ||
      info.permissions.includes("declarativeNetRequestWithHostAccess"))
    info.manifestVersion = 3;

  return info;
}

async function waitForABPStarted(driver, originHandle) {
  await driver.switchTo().window(originHandle);

  await driver.wait(async() => {
    let result = await driver.executeAsyncScript(async callback => {
      const message = {type: "testing.getReadyState"};
      if (typeof browser !== "undefined") // Firefox
        browser.runtime.sendMessage(message).then(callback);
      else // Chromium
        chrome.runtime.sendMessage(message, callback);
    });
    return result == "started";
  }, 1000);
}

async function getOriginHandle(driver) {
  let handles = [];
  // The extension may open a welcome page or similar. We need to wait for all
  // tabs to become stable
  await driver.wait(async() => {
    let seenHandles = handles;
    handles = await driver.getAllWindowHandles();
    return handles.every(handle => seenHandles.includes(handle));
  }, 16000, "Handles kept changing after timeout", 5000);

  let origin;
  let handle;
  for (handle of handles) {
    await driver.switchTo().window(handle);
    origin = await driver.executeAsyncScript(async callback => {
      if (typeof browser !== "undefined") { // Firefox
        let info = await browser.management.getSelf();
        callback(info.optionsUrl == location.href ? location.origin : "");
      }
      else if (typeof chrome !== "undefined" &&
               typeof chrome.management !== "undefined") { // Chromium
        new Promise(resolve => {
          chrome.management.getSelf(info => {
            resolve(info.optionsUrl == location.href ? location.origin : "");
          });
        }).then(callback);
      }
      else {
        callback();
      }
    });
    if (origin)
      break;
  }

  return {origin, handle};
}

async function waitForExtension(driver) {
  console.log(`Sleeping ${helperExtTimeout}ms to let the extension load...`);
  await new Promise(r => setTimeout(r, helperExtTimeout));

  let {origin, handle} = await getOriginHandle(driver);
  if (!origin)
    throw new Error("Extension didn't start correctly, options is not shown");

  let {name, version, manifestVersion} = await getExtensionInfo(driver, handle);
  console.log(`Extension: ${name} ${version} MV${manifestVersion}`);
  if (name == "Adblock Plus")
    await waitForABPStarted(driver, handle);

  return [handle, origin];
}

async function getPageTests() {
  let options = TEST_PAGES_INSECURE ? {https: {rejectUnauthorized: false}} : {};
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
  if (CUSTOM_BROWSER){
    browserVersions = {};
    browserVersions[CUSTOM_BROWSER] = [CUSTOM_BROWSER_VERSION];
  }

  for (let [browser, versions] of Object.entries(browserVersions)) {
    for (let version of versions) {
      describe(`Browser: ${browser} ${version || "latest"}`, function() {
        this.timeout(0);
        this.pageTests = pageTests;
        this.testPagesURL = TEST_PAGES_URL;

        before(async function() {
          let headless = browser == "firefox";
          console.log(`Getting ready to run ${browser}...`);
          this.driver = await BROWSERS[browser].getDriver(
            version,
            {headless, extensionPaths, incognito: false, insecure: true}
          );
          await this.driver.manage().setTimeouts({pageLoad: 20000});

          let cap = await this.driver.getCapabilities();
          this.browserName = cap.getBrowserName();
          this.browserVersion = cap.getBrowserVersion();
          console.log(`Browser: ${this.browserName} ${this.browserVersion}`);

          try {
            // Wait for extension to finish installation
            await this.driver.sleep(2000);
            [this.extensionHandle, this.extensionOrigin] =
              await waitForExtension(this.driver);
          }
          catch (err) {
            console.error(err);
            await writeScreenshotAndThrow(this, err);
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
