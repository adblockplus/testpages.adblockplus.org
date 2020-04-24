"use strict";

var aopwf = {fp() {}}; // eslint-disable-line no-var

setTimeout(() =>
{
  removeWaitingContent(); // eslint-disable-line no-undef

  aopwf.fp = function() {};
  let failElement = document.createElement("div");
  failElement.innerHTML = "Failed. Script ran and was applied to the page.";
  failElement.className = "testcase-bad-element blocked";
  document.getElementById("functionproperty-target").appendChild(failElement);
}, 500);
