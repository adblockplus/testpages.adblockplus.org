"use strict";

setTimeout(() =>
{
  let target = document.getElementById("subproperty-target");
  target.querySelector(".testcase-waitingcontent").remove();

  if (!window.aopwsp || !window.aopwsp.showing)
  {
    if (!window.aopwsp || typeof window.aopwsp != "object")
      window.aopwsp = {};
    window.aopwsp.showing = true;
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    target.appendChild(failElement);
  }
}, 500);
