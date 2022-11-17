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

import Jimp from "jimp";

import specializedTests from "./specialized.js";
import {takeScreenshot, writeScreenshotFile, writeScreenshotAndThrow}
  from "../misc/screenshots.js";

export function isExcluded(page, browserName) {
  let excluded = [];
  if (page in specializedTests)
    excluded = specializedTests[page].excludedBrowsers || [];
  // https://gitlab.com/eyeo/developer-experience/testpages.adblockplus.org/-/issues/74
  else if (page == "filters/websocket" || page == "exceptions/websocket")
    excluded = ["MicrosoftEdge", "msedge", "firefox", "chrome"];
  // https://gitlab.com/eyeo/developer-experience/testpages.adblockplus.org/-/issues/41
  else if (page == "exceptions/sitekey" && process.platform == "win32")
    excluded = ["MicrosoftEdge", "msedge"];
  // https://gitlab.com/eyeo/adblockplus/abc/webext-sdk/-/issues/356
  else if (page == "exceptions/iframe")
    excluded = ["firefox"];
  // https://gitlab.com/eyeo/adblockplus/adblockpluschrome/-/issues/306#note_484130304
  else if (page == "filters/webrtc" || page == "exceptions/webrtc")
    excluded = ["MicrosoftEdge", "msedge", "firefox", "chrome"];

  return excluded.includes(browserName);
}

export async function getExpectedScreenshot(context, url) {
  let {driver} = context;
  try {
    await driver.navigate().to(`${url}?expected=1`);
    await driver.wait(() => driver.executeScript(() => {
      let ready = document.body.className.includes("expected-view");
      for (let frame of document.getElementsByTagName("iframe")) {
        if (frame.contentDocument) {
          ready = ready &&
            frame.contentDocument.body.className.includes("expected-view");
        }
      }
      return ready;
    }), 1000, "Expected view is not ready");
  }
  catch (err) {
    await writeScreenshotAndThrow(context, err);
  }
  return await takeScreenshot(driver);
}

export async function runGenericTests(driver, expectedScreenshot, browserName,
                                      browserVersion, testTitle, url) {
  let actualScreenshot;

  async function compareScreenshots() {
    await driver.wait(async() => {
      actualScreenshot = await takeScreenshot(driver);
      return Jimp.diff(actualScreenshot, expectedScreenshot).percent == 0;
    }, 10000, "Screenshots don't match", 500);
  }

  try {
    try {
      await compareScreenshots();
    }
    catch (e2) {
      // In newer Firefox versions (79+) CSS might be cached:
      // https://bugzil.la/1657575.
      // We execute the test in a new tab to ensure the cache isn't used.
      try {
        await driver.switchTo().newWindow("tab");
        await driver.navigate().to(url);
      }
      catch (e3) {
        // Older browsers don't support `newWindow`, fall-back to just refresh.
        await driver.navigate().refresh();
      }

      await compareScreenshots();
    }
  }
  catch (e) {
    let paths = [];
    for (let [suffix, image] of [["actual", actualScreenshot],
                                 ["expected", expectedScreenshot]]) {
      paths.push(await writeScreenshotFile(image, browserName, browserVersion,
                                           testTitle, suffix));
    }

    throw new Error(`${e.message}\n${url}\n(see ${paths})`);
  }
}

export function getPage(url) {
  return url.substr(url.lastIndexOf("/", url.lastIndexOf("/") - 1) + 1);
}

export async function runFirstTest(context, testCases) {
  let {driver, browserName, browserVersion, test} = context;
  for (let [url] of testCases) {
    let page = getPage(url);
    if (!(isExcluded(page, browserName) || page in specializedTests)) {
      let expectedScreenshot = await getExpectedScreenshot(context, url);
      await driver.navigate().to(url);
      await runGenericTests(driver, expectedScreenshot, browserName,
                            browserVersion, test.title, url);
      return;
    }
  }
  throw new Error("No generic test did run");
}
