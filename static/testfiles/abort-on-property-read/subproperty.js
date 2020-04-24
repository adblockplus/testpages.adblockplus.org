"use strict";

var aopr = {sp: false}; // eslint-disable-line no-var

setTimeout(() =>
{
  removeWaitingContent(); // eslint-disable-line no-undef

  if (!aopr.sp)
  {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    document.getElementById("subproperty-target").appendChild(failElement);
    aopr.sp = true;
  }
}, 500);
