"use strict";

setTimeout(() =>
{
  removeWaitingContent(); // eslint-disable-line no-undef

  if (!window.aopwb)
  {
    window.aopwb = true;
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById("basic-target").appendChild(failElement);
  }
}, 500);
