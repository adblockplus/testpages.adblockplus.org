"use strict";

var aoprf = { fp() {} };

setTimeout(() => {
  let targetId = "functionproperty-target";
  removeWaitingContent(targetId);

  if (!aoprf.fp()) {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById(targetId).appendChild(failElement);
  }
}, 500);
