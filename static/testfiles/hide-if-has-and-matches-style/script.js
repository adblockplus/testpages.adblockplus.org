"use strict";

function addTarget(id, className, innerHTML)
{
  let target = document.createElement("div");
  target.id = Math.random().toString(36).substring(2);
  target.className = className;
  target.innerHTML = innerHTML;
  document.getElementById(`${id}-target`).appendChild(target);
}

setTimeout(() =>
{
  removeWaitingContent(); // eslint-disable-line no-undef

  addTarget(
    "basic",
    "testcase-bad-element blocked",
    `<span>Failed. Element is not hidden.<br></span>
      <span class='label'><a href='#basic-target-ad'>basic-target-ad</a></span>`
  );
  addTarget(
    "comments",
    "testcase-good-element",
    `<span>Should not be hidden</span>
      <span class='label' style='display: none'>
      <a href='#comments-target-ad'>comments-target-ad</a></span>`
  );
}, 500);
