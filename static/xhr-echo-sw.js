"use strict";

/* eslint-env serviceworker */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", event => {
  if (!event.request.url.includes("/xhr-request-echo") ||
      event.request.method !== "POST")
    return;

  event.respondWith(
    event.request.text().then(body =>
      new Response(body, {
        status: 200,
        headers: {"Content-Type": "text/plain"}
      })
    )
  );
});
