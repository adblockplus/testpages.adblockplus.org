/* eslint-disable strict */

aoprb = false; // eslint-disable-line no-undef

setTimeout(() =>
{
  removeWaitingElements(); // eslint-disable-line no-undef

  if (!aoprb) // eslint-disable-line no-undef
  {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    document.getElementById("basic-target").appendChild(failElement);
    aoprb = true; // eslint-disable-line no-undef
  }
}, 500);
