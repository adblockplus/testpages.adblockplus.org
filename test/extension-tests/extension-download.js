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

// const URL = "https://gitlab.com/api/v4/projects/62936800/releases"; // rowan
// const URL = "https://gitlab.com/api/v4/projects/59518842/releases"; // ext releases

// TEST JSON as those changes are not yet in releases repo
const info = [
  {
    "name": "AdBlock 99.99.9",
    "tag_name": "adblock-99.99.9",
    "description": null,
    "created_at": "2024-10-28T13:08:27.696Z",
    "released_at": "2024-10-28T13:08:27.696Z",
    "upcoming_release": false,
    "assets": {
      "count": 9,
      "links": [
        {
          "id": 5120561,
          "name": "adblockbeta-chrome-44f3b275-mv3.zip",
          "url": "https://gitlab.com/-/project/62936800/uploads/fc8615b2b90d05e570ca64e98bf931ca/adblockbeta-chrome-44f3b275-mv3.zip",
          "direct_asset_url": "https://gitlab.com/r.deysel/extensions/-/releases/adblock-99.99.9/downloads/adblockbeta-chrome-44f3b275-mv3.zip",
          "link_type": "other"
        },
        {
          "id": 5120553,
          "name": "adblock-firefox-44f3b275-mv2.xpi",
          "url": "https://gitlab.com/-/project/62936800/uploads/dcc67b17fc4b24dc137a37a7dda71d24/adblock-firefox-44f3b275-mv2.xpi",
          "direct_asset_url": "https://gitlab.com/r.deysel/extensions/-/releases/adblock-99.99.9/downloads/adblock-firefox-44f3b275-mv2.xpi",
          "link_type": "other"
        },
        {
          "id": 5120550,
          "name": "adblock-chrome-44f3b275-mv3.zip",
          "url": "https://gitlab.com/-/project/62936800/uploads/95b0eb135ef57360456df1fe79702719/adblock-chrome-44f3b275-mv3.zip",
          "direct_asset_url": "https://gitlab.com/r.deysel/extensions/-/releases/adblock-99.99.9/downloads/adblock-chrome-44f3b275-mv3.zip",
          "link_type": "other"
        },
        {
          "id": 5120544,
          "name": "adblock-chrome-44f3b275-mv2.zip",
          "url": "https://gitlab.com/-/project/62936800/uploads/ff7a038f9e77398c910bdd292ae05892/adblock-chrome-44f3b275-mv2.zip",
          "direct_asset_url": "https://gitlab.com/r.deysel/extensions/-/releases/adblock-99.99.9/downloads/adblock-chrome-44f3b275-mv2.zip",
          "link_type": "other"
        },
        {
          "id": 5120542,
          "name": "adblock-44f3b275.tar.gz",
          "url": "https://gitlab.com/-/project/62936800/uploads/8dba84010d9cc7cfadf0d87bf9130c72/adblock-44f3b275.tar.gz",
          "direct_asset_url": "https://gitlab.com/r.deysel/extensions/-/releases/adblock-99.99.9/downloads/adblock-44f3b275.tar.gz",
          "link_type": "other"
        }
      ]
    },
    "_links": {
      "closed_issues_url": "https://gitlab.com/r.deysel/extensions/-/issues?release_tag=adblock-99.99.9&scope=all&state=closed",
    }
  }
];

async function run() {
  // const info = await got(URL).json();

  let manifestVersion = process.env.MANIFEST_VERSION || "2";

  // this will get the first occurence of the file, but that should be good enough, as releases are shown from the most recent one to the oldest one
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
  console.log(`${extensionLink} extracted to ${testext}`);
}

run();
console.log("Downloading ABP extension..."); // eslint-disable-line no-console

