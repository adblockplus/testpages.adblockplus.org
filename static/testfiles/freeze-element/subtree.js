"use strict";

setTimeout(() => {
  removeWaitingContent(); // eslint-disable-line no-undef

  let failElement = document.createElement("div");
  failElement.innerHTML = "Failed. Descendant element was modified.";
  failElement.setAttribute("data-expectedresult", "fail");
  failElement.setAttribute("aria-label", "fail");
  document.getElementById("freeze-subtree-child").appendChild(failElement);
}, 500);
