/* eslint-disable strict */

aoprb = false; // eslint-disable-line no-undef

setTimeout(() =>
{
  let target = document.getElementById("basic-target");
  target.querySelector(".testcase-waitingcontent").remove();

  if (!aoprb) // eslint-disable-line no-undef
  {
    let failElement = document.createElement("div");
    failElement.innerHTML = "Failed. Script ran and was applied to the page.";
    failElement.className = "testcase-bad-element blocked";
    target.appendChild(failElement);
    aoprb = true; // eslint-disable-line no-undef
  }
}, 500);
