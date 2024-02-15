"use strict";

function removeWaitingContent(targetId) {
  let className = "testcase-waiting-content";
  let targetNode = (typeof targetId != "undefined") ? document.getElementById(targetId) : document;
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
    let {frames} = doc.defaultView;
    for (let i = 0; i < frames.length; i++) {
      try {
        documents.push(frames[i].document);
        frames[i].document.defaultView.addEventListener("DOMContentLoaded", expectedPageView);
      }
      catch (e) {}
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (expectedParameter())
    expectedPageView();
});

// Replaces every removed child of targetNode with the specified class with a green element
function verifyTargetRemoved(targetNode, classNameToCheck) {
  // Required for expected pages
  const url = window.location.href;
  if (url.endsWith("?expected=1")) {
    const divElement = document.createElement("div");
    divElement.className = "testcase-examplecontent";
    divElement.setAttribute("aria-label", "pass");
    divElement.textContent = "Target removed";
    targetNode.appendChild(divElement);
    return;
  }

  const callback = (mutations, observer) => {
    mutations.forEach(mutation => {
      mutation.removedNodes.forEach(removedNode => {
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
    subtree: true
  };

  observer.observe(targetNode, observerConfig);
}
