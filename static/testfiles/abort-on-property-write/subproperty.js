"use strict";

setTimeout(() => {
  removeWaitingContent(); // eslint-disable-line no-undef

  if (!window.aopwsp || !window.aopwsp.showing) {
    if (!window.aopwsp || typeof window.aopwsp != "object")
      window.aopwsp = {};
    window.aopwsp.showing = true;
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById("subproperty-target").appendChild(failElement);
  }
}, 500);
