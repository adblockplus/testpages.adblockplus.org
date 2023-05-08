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
import {runWithHandle} from "../misc/utils.js";

const {By} = webdriver;

let specialized = {};

function clickButtonOrLink(element) {
  return element.findElement(By.css("a[href],button")).click();
}

async function checkRequestBlocked(driver, resource) {
  let removeTimestamp = s => s.replace(/\?.\d*/, "");

  await driver.wait(async() => {
    let logs = await driver.manage().logs().get("browser");
    let expected =
      `${resource} - Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`;
    return logs.some(l => removeTimestamp(l.message).includes(expected));
  }, 2000, "request wasn't blocked");
}

async function checkPing(driver, element) {
  await clickButtonOrLink(element);
  await checkRequestBlocked(driver, "ping");
}

specialized["filters/ping"] = {
  // ping test needs access to browser logs
  // https://github.com/mozilla/geckodriver/issues/284
  excludedBrowsers: ["firefox"],

  run: checkPing
};

specialized["exceptions/ping"] = {
  excludedBrowsers: ["firefox"],

  async run(driver, element) {
    await assert.rejects(async() => checkPing(driver, element),
                         /request wasn't blocked/);
  }
};

async function checkPopup(driver, element, extensionHandle, shouldBlockPopup) {
  let token = Math.floor(Math.random() * 1e8);
  await runWithHandle(driver, extensionHandle, () =>
    driver.executeScript((...args) => {
      self[`tabCreated${args[0]}`] = new Promise(resolve => {
        chrome.tabs.onCreated.addListener(function listener() {
          chrome.tabs.onCreated.removeListener(listener);
          resolve("tab created");
        });
      });
    }, token));
  await clickButtonOrLink(element);

  let id = await element.getAttribute("id");
  await driver.wait(async() => {
    let found = false;
    for (let handle of await driver.getAllWindowHandles()) {
      try {
        let url =
          await runWithHandle(driver, handle, () => driver.getCurrentUrl());
        // needs to match filters/popup.tmpl and exceptions/popup.tmpl urls
        found = found || url.includes("/testfiles/popup");
      }
      catch (err) {
        if (err.name != "NoSuchWindowError")
          throw err;
      }
    }
    return shouldBlockPopup ? !found : found;
  }, 2000, `Popup ${id} was ${shouldBlockPopup ? "not " : ""}blocked`);

  let message = await runWithHandle(driver, extensionHandle, () =>
    driver.executeAsyncScript(async(...args) => {
      let callback = args[args.length - 1];
      let msg = await self[`tabCreated${args[0]}`];
      callback(msg);
    }, token));

  if (message != "tab created")
    throw new Error(`Clicking button or link failed: ${message}`);
}

specialized["filters/popup"] = {
  async run(driver, element, extensionHandle) {
    await checkPopup(driver, element, extensionHandle, true);
  }
};

specialized["exceptions/popup"] = {
  async run(driver, element, extensionHandle) {
    await checkPopup(driver, element, extensionHandle, false);
  }
};

specialized["filters/other"] = {
  // other test needs access to browser logs
  // https://github.com/mozilla/geckodriver/issues/284
  excludedBrowsers: ["firefox"],

  async run(driver) {
    await checkRequestBlocked(driver, "other/image.png");
  }
};

export {specialized as default};
