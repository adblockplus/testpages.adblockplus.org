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
import {takeFullPageScreenshot} from "@eyeo/get-browser-binary";

const SCREENSHOT_DIR = path.join("test", "screenshots");

export function takeScreenshot(driver) {
  return takeFullPageScreenshot(driver);
}

export async function writeScreenshotFile(image, browserName, browserVersion,
                                          testTitle, suffix) {
  let title = testTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  suffix = suffix ? `_${suffix}` : "";
  let filename = `${browserName}_${browserVersion}_${title}${suffix}.png`;
  let screenshotPath = path.join(SCREENSHOT_DIR, filename);
  await image.write(screenshotPath);
  return screenshotPath;
}

export async function writeScreenshotAndThrow(context, error) {
  let {driver, browserName, browserVersion, test} = context;
  let screenshot = await takeScreenshot(driver);
  let scrPath = await writeScreenshotFile(screenshot, browserName,
                                          browserVersion, test.title);
  if (error)
    throw new Error(`${error.message || error}\n(see ${scrPath})`);
}
