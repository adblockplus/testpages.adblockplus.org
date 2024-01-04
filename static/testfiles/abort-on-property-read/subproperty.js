"use strict";

var aopr = {sp: false}; // eslint-disable-line no-var

setTimeout(() => {
  let targetId = "subproperty-target";
  removeWaitingContent(targetId); // eslint-disable-line no-undef

  if (!aopr.sp) {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById(targetId).appendChild(failElement);
    aopr.sp = true;
  }
}, 500);
