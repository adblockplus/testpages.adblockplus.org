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
    if (typeof chrome != "undefined" && typeof chrome.management != "undefined")
      chrome.runtime.sendMessage({type: "debug.getLastError"}, callback);
  });

  if (error == null)
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
