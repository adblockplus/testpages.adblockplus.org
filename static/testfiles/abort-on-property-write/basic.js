"use strict";

setTimeout(() =>
{
  removeWaitingElements(); // eslint-disable-line no-undef

  if (!window.aopwb)
  {
    window.aopwb = true;
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    document.getElementById("basic-target").appendChild(failElement);
  }
}, 500);
