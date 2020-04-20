"use strict";

var aopr = {sp: false}; // eslint-disable-line no-var

setTimeout(() =>
{
  let target = document.getElementById("subproperty-target");
  target.querySelector(".testcase-waitingcontent").remove();

  if (!aopr.sp)
  {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    target.appendChild(failElement);
    aopr.sp = true;
  }
}, 500);
