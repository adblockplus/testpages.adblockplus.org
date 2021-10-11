"use strict";

function addTarget(id, expectedResult, innerHTML)
{
  let target = document.createElement("div");
  target.id = Math.random().toString(36).substring(2);
  target.setAttribute("data-expectedresult", expectedResult);
  if (expectedResult == "fail")
    target.setAttribute("aria-label", "fail");
  target.innerHTML = innerHTML;
  document.getElementById(`${id}-target`).appendChild(target);
}

setTimeout(() =>
{
  removeWaitingContent(); // eslint-disable-line no-undef

  addTarget(
    "basic",
    "fail",
    `<span>Failed. Element is not hidden.<br></span>
      <span class='label'><a href='#basic-target-ad'>basic-target-ad</a></span>`
  );
  addTarget(
    "comments",
    "pass",
    `<span>Should not be hidden</span>
      <span class='label' style='display: none'>
      <a href='#comments-target-ad'>comments-target-ad</a></span>`
  );
}, 500);
