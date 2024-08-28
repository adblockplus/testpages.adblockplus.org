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

const URL = "https://gitlab.com/api/v4/projects/22711268/repository/tree";

async function run() {
  let {headers} = await got(`${URL}?page=1&per_page=100`);
  let totalPages = parseInt(headers["x-total-pages"], 10);
  let info = [];

  for (let i = 1; i <= totalPages; i++)
    info.push(await got(`${URL}?page=${i}&per_page=100`).json());

  let manifestVersion = process.env.MANIFEST_VERSION || "2";

  info = info.flat().map(obj => obj.path)
    .filter(p => p.startsWith("adblockplus-chrome") && p.endsWith(`mv${manifestVersion}.zip`))
    .sort((p1, p2) => semver.gt(semver.coerce(p1), semver.coerce(p2)) ? 1 : -1);

  let filename = info[info.length - 1];
  let archive = path.join(process.cwd(), filename);
  let testext = path.join(process.cwd(), "testext");
  await download(`https://gitlab.com/eyeo/adblockplus/downloads/-/raw/master/${filename}?inline=false`,
                 archive);
  await extractZip(archive, {dir: testext});
  // eslint-disable-next-line no-console
  console.log(`${filename} extracted to ${testext}`);
}


run();
console.log("Downloading ABP extension..."); // eslint-disable-line no-console
