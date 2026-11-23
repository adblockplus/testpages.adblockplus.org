"use strict";

/* exported removeWaitingContent, expectedParameter, expectedPageView, verifyTargetRemoved,
   registerControllingServiceWorker, markSkipped */

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

// Marks the test case containing element as deliberately skipped, with a
// reason shown in the panel. A skipped case is neither waiting, passed nor
// failed: it gets no .testcase-waiting-content and no data-expectedresult.
// Call it in both the actual and the expected view, so their screenshots match.
function markSkipped(element, reason) {
  let panel = element.closest(".testcase-panel");
  if (!panel || panel.classList.contains("testcase-skipped")) {
    return;
  }

  panel.classList.add("testcase-skipped");
  panel.setAttribute("data-testcase-skipped", reason);

  let reasonElement = document.createElement("div");
  reasonElement.className = "testcase-skipped-reason";
  reasonElement.textContent = `Skipped: ${reason}`;

  let area = panel.querySelector(".testcase-area");
  if (area) {
    area.after(reasonElement);
  } else {
    panel.appendChild(reasonElement);
  }
}
