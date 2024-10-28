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

import got from "got";
import path from "path";
import extractZip from "extract-zip";
import semver from "semver";

import {download} from "@eyeo/get-browser-binary";

const URL = "https://gitlab.com/api/v4/projects/62936800/releases"; // rowan ("test env")
// const URL = "https://gitlab.com/api/v4/projects/59518842/releases"; // ext releases ("production")

async function run() {
  const info = await got(URL).json();

  let manifestVersion = process.env.MANIFEST_VERSION || "2";

  // this will get the first occurence of the file, but that should be good enough?, as releases are shown from the most recent to the oldest one
  let extensionLinkObject = info[0].assets.links.find(link =>
    link.direct_asset_url &&
      link.direct_asset_url.includes("adblock-chrome") && // this is currently adblock, because there is no adblockplus build available yet with this new formatting
      link.direct_asset_url.endsWith(`mv${manifestVersion}.zip`));

  const extensionLink = extensionLinkObject.direct_asset_url;
  let filename = extensionLink.substring(extensionLink.lastIndexOf("/") + 1);
  let archive = path.join(process.cwd(), filename);
  let testext = path.join(process.cwd(), "testext");
  await download(`${extensionLink}?inline=false`, archive);
  await extractZip(archive, {dir: testext});
  // eslint-disable-next-line no-console
  console.log(`${filename} extracted to ${testext}`);
}

run();
console.log("Downloading ABP extension..."); // eslint-disable-line no-console
