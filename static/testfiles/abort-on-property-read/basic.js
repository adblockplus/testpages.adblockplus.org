/* eslint-disable strict */

aoprb = false; // eslint-disable-line no-undef

setTimeout(() => {
  let targetId = "basic-target";
  removeWaitingContent(targetId); // eslint-disable-line no-undef

  if (!aoprb) { // eslint-disable-line no-undef
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    failElement.setAttribute("aria-label", "fail");
    document.getElementById(targetId).appendChild(failElement);
    aoprb = true; // eslint-disable-line no-undef
  }
}, 500);
