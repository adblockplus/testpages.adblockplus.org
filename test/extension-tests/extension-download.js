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

import {download} from "@eyeo/get-browser-binary";

const URL = "https://gitlab.com/api/v4/projects/59518842/releases";

async function run() {
  let manifestVersion = process.env.MANIFEST_VERSION || "2";

  const infos = await got(URL).json();
  const extensionLinks = infos.flatMap(info => info.assets.links);
  let extensionLinkObject = extensionLinks.find(link =>
    link.direct_asset_url &&
    link.direct_asset_url.includes("adblockplus-chrome") &&
    link.direct_asset_url.endsWith(`mv${manifestVersion}.zip`));

  const extensionLink = extensionLinkObject.direct_asset_url;
  let filename = extensionLink.split("/").pop();
  let archive = path.join(process.cwd(), filename);
  let testext = path.join(process.cwd(), "testext");
  await download(`${extensionLink}?inline=false`, archive);
  await extractZip(archive, {dir: testext});
  // eslint-disable-next-line no-console
  console.log(`${filename} extracted to ${testext}`);
}

run();
console.log("Downloading ABP extension..."); // eslint-disable-line no-console
