"use strict";

setTimeout(() => {
  removeWaitingContent(); // eslint-disable-line no-undef

  let failElement = document.createElement("div");
  failElement.innerHTML = "Failed. Descendant element was modified.";
  failElement.setAttribute("data-expectedresult", "fail");
  failElement.setAttribute("aria-label", "fail");
  // appending to child, but the filter freezes #freeze-subtree-wrapper (the parent)
  document.getElementById("freeze-subtree-child").appendChild(failElement);
}, 500);
