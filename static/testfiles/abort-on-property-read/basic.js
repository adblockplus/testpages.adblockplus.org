/* eslint-disable strict */
/* global aoprb:writable, removeWaitingContent */

aoprb = false;

setTimeout(() => {
  let targetId = "basic-target";
  removeWaitingContent(targetId);

  if (!aoprb) {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById(targetId).appendChild(failElement);
    aoprb = true;
  }
}, 500);
