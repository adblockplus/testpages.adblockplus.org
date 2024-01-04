"use strict";

var aoprf = {fp() {}}; // eslint-disable-line no-var

setTimeout(() => {
  let targetId = "functionproperty-target";
  removeWaitingContent(targetId); // eslint-disable-line no-undef

  if (!aoprf.fp()) {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById(targetId).appendChild(failElement);
  }
}, 500);
