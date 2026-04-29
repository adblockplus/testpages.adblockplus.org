"use strict";

setTimeout(() => {
  removeWaitingContent(); // eslint-disable-line no-undef

  let failElement = document.createElement("div");
  failElement.innerHTML = "Failed. Element was modified.";
  failElement.setAttribute("data-expectedresult", "fail");
  failElement.setAttribute("aria-label", "fail");
  document.getElementById("freeze-basic-target").appendChild(failElement);
}, 500);
