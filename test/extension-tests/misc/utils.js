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

export async function checkLastError(driver, handle) {
  await driver.switchTo().window(handle);

  let error = await driver.executeAsyncScript(async callback => {
    // Firefox
    if (typeof browser !== "undefined")
      browser.runtime.sendMessage({type: "debug.getLastError"}).then(callback);

    // Chromium
    if (typeof chrome != "undefined" && typeof chrome.runtime != "undefined")
      chrome.runtime.sendMessage({type: "debug.getLastError"}, callback);
  });

  if (!error || !error.message)
    return;

  let text = `Unhandled error in background page: ${error.message}`;
  if (process.env.THROW_LAST_ERROR == "true")
    assert.fail(text);
  else
    console.warn(text);
}

export async function runWithHandle(driver, handle, callback) {
  let currentHandle = await driver.getWindowHandle();
  await driver.switchTo().window(handle);
  try {
    return await callback();
  }
  finally {
    await driver.switchTo().window(currentHandle);
  }
}

// As of Microsoft Edge 133 (possibly even Chromium 133), getWindowHandle() also
// returns the extensions' background pages, so we need to ignore them, in order
// not to accidentally interact with those.
export async function safeGetAllWindowHandles(driver, browserName) {
  if (browserName === "firefox")
    return await driver.getAllWindowHandles();

  const previousHandle = await driver.getWindowHandle();

  const allHandles = await driver.getAllWindowHandles();
  const safeHandles = [];
  for (const handle of allHandles) {
    try {
      await driver.switchTo().window(handle);
      const url = await driver.getCurrentUrl();
      if (url.includes("_generated_background_page.html"))
        continue;

      safeHandles.push(handle);
    }
    catch (ex) {
      // Ignoring errors here, as they have no impact on anything that comes
      // after it
    }
  }

  try {
    await driver.switchTo().window(previousHandle);
  }
  catch (ex) {
    console.error("Failed to switch back to previous handle", ex);
  }

  return safeHandles;
}
