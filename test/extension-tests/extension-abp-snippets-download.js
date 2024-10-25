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

import fs from "node:fs";
import {pipeline} from "node:stream";
import {promisify} from "node:util";
import {readdir, rm, unlink} from "node:fs/promises";

/**
 * Downloads url resources.
 * @param {string} url - The url of the resource to be downloaded.
 * @param {string} destFile - The destination file path.
 * @param {Object} options - The options for the request.
 * @throws {TypeError} Invalid URL.
 */
export async function downloadWithOptions(url, destFile, options = {}) {
  let cacheDir = path.dirname(destFile);

  await fs.promises.mkdir(cacheDir, {recursive: true});

  let tempDest = `${destFile}-${process.pid}`;
  let writable = fs.createWriteStream(tempDest);

  try {
    await promisify(pipeline)(got.stream(url, options), writable);
  }
  catch (error) {
    try {
      await fs.promises.rm(tempDest, {recursive: true});
    }
    catch (e) {}

    throw error;
  }

  await fs.promises.rename(tempDest, destFile);
}


async function run() {
  const abpsnippetsDownloadToken =
    typeof process.env.ANTI_CV_TOKEN !== "undefined";
  if (!abpsnippetsDownloadToken) {
    throw new Error(
      "No authentication token found."
    );
  }

  const authOptions = {
    headers: {
      "PRIVATE-TOKEN": process.env.ANTI_CV_TOKEN
    }
  };

  const filename = "next.zip";
  let archive = path.join(process.cwd(), filename);
  let testext = path.join(process.cwd(), "testext");
  await downloadWithOptions(
    "https://gitlab.com/api/v4/projects/23002705/jobs/artifacts/next/download?job=build-abp",
    archive,
    authOptions
  );

  try {
    await extractZip(archive, {dir: testext});
    const distBuildABP = path.join(testext, "dist-build-abp");
    // Get the list of files in the extracted directory
    const files = await readdir(distBuildABP);

    let manifestVersion = process.env.MANIFEST_VERSION || "2";
    // eslint-disable-next-line no-console
    console.log("Using Manifest Version:", manifestVersion);

    const fileFilter = file => {
      return file.startsWith("adblockplus-chrome") &&
             file.endsWith(`mv${manifestVersion}.zip`);
    };
    const extensionFileName = files.find(fileFilter);

    if (extensionFileName) {
      const targetZipFilePath = path.join(distBuildABP, extensionFileName);
      await extractZip(targetZipFilePath, {dir: testext});

      // Remove the original .zip file
      await unlink(targetZipFilePath);
      // eslint-disable-next-line no-console
      console.log(`${extensionFileName} extracted to ${testext}`);
    }
    else {
      console.error("Target .zip file not found.");
    }

    // Delete the distBuildABP folder 
    await rm(distBuildABP, {recursive: true});
  }
  finally {
    await unlink(archive);
  }
}

run();
console.log("Downloading ABP extension..."); // eslint-disable-line no-console
