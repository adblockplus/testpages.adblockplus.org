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
import url from "url";
import fs from "fs";
import crypto from "crypto";

import express from "express";
import nunjucks from "nunjucks";

const HOST = "localhost";
const HTTP_PORT = 4000;

let dirname = path.dirname(url.fileURLToPath(import.meta.url));
let app = express();

nunjucks.configure(path.join(dirname, "sitekey"), {
  autoescape: true,
  express: app
});

// Documentation on sitekey server implementation:
// https://help.adblockplus.org/hc/en-us/articles/360062733293#sitekey_server
app.get("/sitekey-frame", async(req, res) => {
  let privateKey = crypto.createPrivateKey(
    await fs.promises.readFile(path.join(dirname, "sitekey", "site.key")));
  let publicKey = crypto.createPublicKey(privateKey);
  let spki = publicKey.export({type: "spki", format: "der"});
  let data = `${req.url}\0${req.get("Host")}\0${req.get("User-Agent")}`;
  let signature = crypto.sign("rsa-sha1", Buffer.from(data), privateKey);

  let adblockkey = `${spki.toString("base64")}_${signature.toString("base64")}`;
  res.header("X-Adblock-Key", adblockkey);
  res.header("Content-Type", "text/html; charset=utf-8");

  res.render("sitekey_frame.njk", {adblockkey});
});

app.use(express.static(path.join(dirname, "..", "static")));

app.get("/", (req, res) => {
  res.send(`Invalid endpoint: ${req.url}`);
});

app.listen(HTTP_PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Endpoints server listening at http://${HOST}:${HTTP_PORT}`);
});
