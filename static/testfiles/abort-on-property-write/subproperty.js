"use strict";

setTimeout(() =>
{
  if (!window.aopwsp || !window.aopwsp.showing)
  {
    if (!window.aopwsp || typeof window.aopwsp != "object")
      window.aopwsp = {};
    window.aopwsp.showing = true;
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    document.getElementById("subproperty-target").appendChild(failElement);
  }
}, 500);
