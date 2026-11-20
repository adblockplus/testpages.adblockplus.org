"use strict";

/* exported removeWaitingContent, expectedParameter, expectedPageView, verifyTargetRemoved,
   registerControllingServiceWorker */

function removeWaitingContent(targetId) {
  let className = "testcase-waiting-content";
  let targetNode = typeof targetId != "undefined" ? document.getElementById(targetId) : document;
  let elements = targetNode.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].remove();
    elements = targetNode.getElementsByClassName(className);
  }
}

function expectedParameter() {
  let url = new URL(window.location.href);
  return url.searchParams.get("expected") == "1";
}

function expectedPageView() {
  let documents = [document];
  while (documents.length > 0) {
    let doc = documents.shift();
    doc.body.classList.add("expected-view");
    let { frames } = doc.defaultView;
    for (let i = 0; i < frames.length; i++) {
      try {
        documents.push(frames[i].document);
        frames[i].document.defaultView.addEventListener("DOMContentLoaded", expectedPageView);
      } catch (e) {
        // no-op
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (expectedParameter()) {
    expectedPageView();
  }
});

// Replaces every removed child of targetNode with the specified class with a green element
function verifyTargetRemoved(targetNode, classNameToCheck) {
  const callback = (mutations, observer) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if (removedNode.className.split(" ").includes(classNameToCheck)) {
          const divElement = document.createElement("div");
          divElement.setAttribute("data-expectedresult", "pass");
          divElement.setAttribute("aria-label", "pass");
          divElement.textContent = "Target removed";
          targetNode.appendChild(divElement);
        }
      });
    });
  };

  const observer = new MutationObserver(callback);

  const observerConfig = {
    childList: true,
    subtree: true,
  };

  observer.observe(targetNode, observerConfig);
}

// Registers a service worker and resolves once it controls this page, so the
// page's own requests reach it. `ready` alone resolves on activation, which can
// precede the worker's clients.claim(). Resolves at once without SW support.
function registerControllingServiceWorker(scriptUrl) {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve();
  }
  const { serviceWorker } = navigator;
  return serviceWorker
    .register(scriptUrl)
    .then(() => serviceWorker.ready)
    .then(() => {
      if (serviceWorker.controller) {
        return;
      }
      return new Promise((resolve) => {
        serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
      });
    });
}
