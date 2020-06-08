/* eslint-disable strict */

aoprb = false; // eslint-disable-line no-undef

setTimeout(() =>
{
  removeWaitingContent(); // eslint-disable-line no-undef

  if (!aoprb) // eslint-disable-line no-undef
  {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.setAttribute("data-expectedresult", "fail");
    document.getElementById("basic-target").appendChild(failElement);
    aoprb = true; // eslint-disable-line no-undef
  }
}, 500);
