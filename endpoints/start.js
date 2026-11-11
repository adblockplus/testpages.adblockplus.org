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
import { WebSocketServer } from "ws";

// Node.js 17+ resolves "localhost" to ::1 when IPv6 is available, but nginx
// upstreams resolve it to 127.0.0.1, causing connection refused. The
// production image sets HOST=0.0.0.0 and Cloud Run sets PORT.
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 4000;
// Generated site to serve (production only). Locally and in the test image,
// nginx serves the pages and forwards only the endpoint paths here.
const STATIC_DIR = process.env.STATIC_DIR;
const WEBSOCKET_PATHS = new Set(["/websocket", "/exception_websocket"]);

let dirname = path.dirname(url.fileURLToPath(import.meta.url));
let app = express();

// The frame needs only the key filled in. The key is base64 joined with "_",
// so it contains no characters that need HTML escaping.
let sitekeyFrame = fs.readFileSync(path.join(dirname, "sitekey", "sitekey_frame.html"), "utf8");

// Documentation on sitekey server implementation:
// https://help.adblockplus.org/hc/en-us/articles/360062733293#sitekey_server
app.get("/sitekey-frame", async (req, res) => {
  let privateKey = crypto.createPrivateKey(await fs.promises.readFile(path.join(dirname, "sitekey", "site.key")));
  let publicKey = crypto.createPublicKey(privateKey);
  let spki = publicKey.export({ type: "spki", format: "der" });
  let data = `${req.url}\0${req.get("Host")}\0${req.get("User-Agent")}`;
  let signature = crypto.sign("rsa-sha1", Buffer.from(data), privateKey);

  let adblockkey = `${spki.toString("base64")}_${signature.toString("base64")}`;
  res.header("X-Adblock-Key", adblockkey);
  res.header("Content-Type", "text/html; charset=utf-8");

  res.send(sitekeyFrame.replace("{{ adblockkey }}", () => adblockkey));
});

if (STATIC_DIR) {
  let root = path.resolve(STATIC_DIR);

  app.use((req, res, next) => {
    res.header("Strict-Transport-Security", "max-age=31536000");
    next();
  });

  // Same rules as test/etc/nginx/sites-enabled/testpages.conf: serve
  // /<path> from /en/<path> when only the English page exists, and the
  // language folders' "index" page for / and /<lang>/.
  app.use((req, res, next) => {
    if (/^\/\w\w(_\w\w)?$/.test(req.path)) {
      return res.redirect(301, `${req.path}/`);
    }
    if (req.path == "/") {
      req.url = "/en/index";
      return next();
    }

    let file;
    try {
      file = path.join(root, "en", decodeURIComponent(req.path));
    } catch {
      return next();
    }
    if (file.startsWith(path.join(root, "en") + path.sep) && fs.existsSync(file)) {
      req.url = `/en${req.url}`;
    }
    next();
  });

  app.use(
    express.static(root, {
      index: ["index"],
      maxAge: "1d",
      setHeaders(res, file) {
        if (!path.extname(file)) {
          res.header("Content-Type", "text/html; charset=utf-8");
        }
      },
    }),
  );
} else {
  app.use(express.static(path.join(dirname, "..", "static")));

  app.get("/", (req, res) => {
    res.send(`Invalid endpoint: ${req.url}`);
  });
}

let server = app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Endpoints server listening at http://${HOST}:${PORT}`);
});

// Both WebSocket paths are echo servers: filters block one and allowlist the
// other, so they only need distinct URLs.
let wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  ws.send("echo");
});

server.on("upgrade", (req, socket, head) => {
  if (!WEBSOCKET_PATHS.has(new URL(req.url, "http://localhost").pathname)) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});
