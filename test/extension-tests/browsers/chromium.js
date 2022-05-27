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

import webdriver from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import got from "got";
import path from "path";
import {exec, execFile} from "child_process";
import {promisify} from "util";

import {downloadChromium} from "webext-sdk/test/browser-download.js";

// We need to require the chromedriver,
// otherwise on Windows the chromedriver path is not added to process.env.PATH.
import "chromedriver";

export let target = "chrome";

// The Chromium version is a build number, quite obscure.
// Chromium 77.0.3865.0 is 681094
export let oldestCompatibleVersion = 681094;

export async function ensureBrowser(revision) {
  return (await downloadChromium(revision)).binary;
}

export async function ensureDriver(browserBinary) {
  let chromedriverPath =
    path.resolve("webext-sdk", "test", "chromium-snapshots", "chromedriver");
  let env = {...process.env, npm_config_chromedriver_skip_download: false,
             npm_config_tmp: chromedriverPath};
  if (browserBinary) {
    let browserVersion;
    if (process.platform == "win32") {
      let arg = `'${browserBinary.split("'").join("''")}'`;
      let command = `(Get-ItemProperty ${arg}).VersionInfo.ProductVersion`;
      let {stdout} = await promisify(exec)(command, {shell: "powershell.exe"});
      browserVersion = stdout.trim();
    }
    else {
      let {stdout} = await promisify(execFile)(browserBinary, ["--version"]);
      browserVersion = stdout.trim().replace(/.*\s/, "");
    }

    env.CHROMEDRIVER_VERSION = `LATEST_${browserVersion}`;
  }
  else {
    env.DETECT_CHROMEDRIVER_VERSION = true;
  }

  await promisify(execFile)(
    process.execPath,
    [path.join("node_modules", "chromedriver", "install.js")],
    {env}
  );
}

export async function getDriver(browserBinary, extensionPaths, insecure) {
  await ensureDriver(browserBinary);

  let options = new chrome.Options()
    .addArguments("--no-sandbox", "--disable-gpu")
    .addArguments(`load-extension=${extensionPaths.join(",")}`);

  if (browserBinary != null)
    options.setChromeBinaryPath(browserBinary);
  if (insecure)
    options.addArguments("--ignore-certificate-errors");

  return new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

export async function getVersion(channel = "stable") {
  let os = process.platform;
  if (os == "win32")
    os = process.arch == "x64" ? "win64" : "win";
  else if (os == "darwin")
    os = "mac";
  let data = await got(`https://omahaproxy.appspot.com/all.json?os=${os}`).json();
  let version = data[0].versions.find(ver => ver.channel == channel);
  let base = version.branch_base_position;

  if (version.true_branch && version.true_branch.includes("_")) {
    // A wrong base may be caused by a mini-branch (patched) release
    // In that case, the base is taken from the unpatched version
    let cv = version.current_version.split(".");
    let unpatched = `${cv[0]}.${cv[1]}.${cv[2]}.0`;
    let unpatchedVersion = await got(`https://omahaproxy.appspot.com/deps.json?version=${unpatched}`).json();
    base = unpatchedVersion.chromium_base_position;
  }

  return base;
}
