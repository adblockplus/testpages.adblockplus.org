"use strict";

setTimeout(() =>
{
  let target = document.getElementById("basic-target");
  target.querySelector(".testcase-waitingcontent").remove();

  if (!window.aopwb)
  {
    window.aopwb = true;
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    target.appendChild(failElement);
  }
}, 500);
