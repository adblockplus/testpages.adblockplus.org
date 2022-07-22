"use strict";

var aopwf = {fp() {}}; // eslint-disable-line no-var

setTimeout(() => {
  removeWaitingContent(); // eslint-disable-line no-undef

  aopwf.fp = function() {};
  let failElement = document.createElement("div");
  failElement.innerHTML = "Failed. Script ran and was applied to the page.";
  failElement.setAttribute("data-expectedresult", "fail");
  failElement.setAttribute("aria-label", "fail");
  document.getElementById("functionproperty-target").appendChild(failElement);
}, scriptDelayMs()); // eslint-disable-line no-undef
