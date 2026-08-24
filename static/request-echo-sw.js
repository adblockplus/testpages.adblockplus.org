"use strict";

/* eslint-env serviceworker */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Paths echoed back verbatim. The replace-xhr-request and
// replace-fetch-request test pages each POST to their own path and assert on
// what comes back, so they can share this one worker.
const echoPaths = ["/xhr-request-echo", "/fetch-request-echo"];

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "POST" || !echoPaths.some((path) => event.request.url.includes(path))) {
    return;
  }

  event.respondWith(
    event.request.text().then(
      (body) =>
        new Response(body, {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
    ),
  );
});
